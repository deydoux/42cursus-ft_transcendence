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
    return Clients.sendClient(client, {type: 'error', message: 'Invalid game'});

  try {
    server.playAvailability(client);
  } catch {
    return;
  }

  let match = null;

  switch (message.mode) {
    case 'casual': {
      const user = await server.db.get(SQL`
        SELECT id, username, has_avatar, avatar_version
        FROM users
        WHERE id = ${client.userID}
      `);
      serializeUserAvatar(user);
      delete user.id;

      const player = {...user, ...client};
      console.log(player);

      if (message.targetID) {
        const inviter = game.queues[message.game].invites.find(
          invite => invite.player.userID === message.targetID,
        );

        if (!inviter) {
          queue.invites.push({
            player,
            other: message.targetID,
          });

          const relationship = await server.db.get(SQL`
            SELECT NULL
            FROM relationships
            WHERE type = 'friend' AND (
                  (user_id = ${client.userID}
                    AND other_id = ${message.targetID})
                  OR (user_id = ${message.targetID}
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

            server.clients.sendUser(message.targetID, {
              type: 'gameInvite',
              game: message.game,
              user,
            });
          }

          break;
        }

        server.leaveMatchmaking(inviter.player.socket);
        match = new MatchConstructor(server, [inviter.player, player]);

        break;
      }

      const queued = game.queues[message.game].casual;
      if (!queued) {
        game.queues[message.game].casual = player;
        break;
      }

      game.queues[message.game].casual = null;

      match = new MatchConstructor(server, [queued, player]);
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
      return Clients.sendClient(client, {
        type: 'error',
        message: 'Invalid mode',
      });
  }

  Clients.sendClient(client, {
    type: 'success',
    origin: 'joinMatchmaking',
  });

  if (match)
    try {
      await match.init();
      await match.start();
    } catch (error) {
      match.error();
      server.log.error(error);
    }
}
