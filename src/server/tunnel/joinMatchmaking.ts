import {Client, ClientTunnelMessage} from '#types/Clients';
import Clients from '#lib/Clients';
import {FastifyInstance} from 'fastify';
import PongMatch from '#lib/PongMatch';

export default async function joinMatchmaking(
  server: FastifyInstance,
  client: Client,
  message: ClientTunnelMessage & {type: 'joinMatchmaking'},
) {
  const {game} = server;

  let MatchConstructor;
  if (message.game === 'pong') MatchConstructor = PongMatch;
  else
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

  if (
    [game.queues.pong.casual?.userID, game.queues.race.casual?.userID].includes(
      client.userID,
    )
  )
    return client.socket.send(
      Clients.message({
        type: 'error',
        message: 'You are already in a matchmaking queue',
      }),
    );

  let match = null;

  switch (message.mode) {
    case 'casual': {
      const queued = game.queues[message.game].casual;
      if (!queued) {
        game.queues[message.game].casual = client;
        return;
      }

      game.queues[message.game].casual = null;

      match = new MatchConstructor(server, [queued, client], false);
      break;
    }
    case 'ranked': {
      // match = new MatchConstructor(server, [queued, client], true);
      server.log.warn('TODO: Handle ranked matchmaking');
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
      await match.start();
    } catch (error) {
      match.error();
      server.log.error(error);
    }
}
