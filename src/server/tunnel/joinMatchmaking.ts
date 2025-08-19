import {Client, ClientTunnelMessage} from '#types/Clients';
import Clients from '#lib/Clients';
import {FastifyInstance} from 'fastify';
import PongMatch from '#lib/PongMatch';
import RaceMatch from '#lib/RaceMatch';
import {RankedClient} from '#types/fastify';
import SQL from 'sql-template-strings';
import {kFactor} from '#lib/Match';
import {randomInt} from 'node:crypto';
import serializeUserAvatar from '#lib/serializeUserAvatar';

export default async function joinMatchmaking(
  server: FastifyInstance,
  client: Client,
  message: ClientTunnelMessage & {type: 'joinMatchmaking'},
) {
  const {game} = server;

  let MatchConstructor, queue;
  if (message.game === 'pong') {
    MatchConstructor = PongMatch;
    queue = game.queues.pong;
  } else if (message.game === 'race') {
    MatchConstructor = RaceMatch;
    queue = game.queues.race;
  } else
    return client.socket.send(
      Clients.message({type: 'error', message: 'Invalid game'}),
    );

  if (game.players[client.userID])
    return client.socket.send(
      Clients.message({
        type: 'error',
        message: 'You are already playing a match',
      }),
    );

  for (const queue of Object.values(game.queues)) {
    if (
      queue.casual?.userID === client.userID ||
      queue.invites.some(invite => invite.client.userID === client.userID) ||
      queue.ranked.some(rankedClient => rankedClient.userID === client.userID)
    )
      return client.socket.send(
        Clients.message({
          type: 'error',
          message: 'You are already in a matchmaking queue',
        }),
      );
  }

  let match = null;

  switch (message.mode) {
    case 'casual': {
      if (message.inviterID) {
        const inviter = game.queues[message.game].invites.find(
          invite => invite.client.userID === message.inviterID,
        );

        if (!inviter) {
          queue.invites.push({
            client,
            other: message.inviterID,
          });

          const relationship = await server.db.get(SQL`
            SELECT NULL
            FROM relationships
            WHERE type = 'friend' AND (
                  (user_id = ${client.userID}
                    AND other_id = ${message.inviterID})
                  OR (user_id = ${message.inviterID}
                       AND other_id = ${client.userID})
            )
          `);

          if (relationship) {
            const user = await server.db.get(SQL`
              SELECT id, username, has_avatar, avatar_version
              FROM users
              WHERE id = ${client.userID}
            `);
            serializeUserAvatar(user);

            server.clients.sendUser(message.inviterID, {
              type: 'gameInvite',
              game: message.game,
              user,
            });
          }

          break;
        }

        server.leaveMatchmaking(inviter.client.socket);
        match = new MatchConstructor(server, [inviter.client, client]);

        break;
      }

      const queued = game.queues[message.game].casual;
      if (!queued) {
        game.queues[message.game].casual = client;
        break;
      }

      game.queues[message.game].casual = null;

      match = new MatchConstructor(server, [queued, client]);
      break;
    }
    case 'ranked': {
      const elo = await server.db.get(SQL`
        SELECT value
        FROM elo
        WHERE game = ${message.game} AND user_id = ${client.userID}
        ORDER BY id DESC
        LIMIT 1
      `);

      const rankedClient: RankedClient = {
        ...client,
        elo: elo.value,
        lowerElo: elo.value,
        upperElo: elo.value,
      };

      rankedClient.timeout = setInterval(
        async rankedClient => {
          rankedClient.lowerElo -= kFactor;
          rankedClient.upperElo += kFactor;

          const matchable = queue.ranked.filter(
            queued =>
              queued.userID !== rankedClient.userID &&
              rankedClient.lowerElo <= queued.elo &&
              queued.elo <= rankedClient.upperElo,
          );

          if (matchable.length === 0) return;

          const queued = matchable[randomInt(matchable.length)];

          server.leaveMatchmaking(rankedClient.socket);
          server.leaveMatchmaking(queued.socket);
          match = new MatchConstructor(server, [queued, rankedClient]);

          try {
            await match.init();
            await match.start();
          } catch (error) {
            match.error();
            server.log.error(error);
          }
        },
        1000,
        rankedClient,
      );

      queue.ranked.push(rankedClient);
      break;
    }
    default:
      return client.socket.send(
        Clients.message({
          type: 'error',
          message: 'Invalid mode',
        }),
      );
  }

  client.socket.send(
    Clients.message({
      type: 'success',
      origin: 'joinMatchmaking',
    }),
  );

  if (match)
    try {
      await match.init();
      await match.start();
    } catch (error) {
      match.error();
      server.log.error(error);
    }
}
