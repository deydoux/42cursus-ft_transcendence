import {Client, ClientTunnelMessage} from '#types/Clients';
import {FastifyInstance} from 'fastify';
import PongMatch from '#lib/PongMatch';

export default function joinMatchmaking(
  server: FastifyInstance,
  client: Client,
  message: ClientTunnelMessage & {type: 'joinMatchmaking'},
) {
  const {clients, game} = server;

  let MatchConstructor;
  if (message.game === 'pong') MatchConstructor = PongMatch;
  else
    return client.socket.send(
      clients.message({type: 'error', message: 'Invalid game'}),
    );

  if (game.players[client.userID])
    return client.socket.send(
      clients.message({
        type: 'error',
        message: 'You are already playing a match',
      }),
    );

  if (game.queues.casual?.userID === client.userID)
    return client.socket.send(
      clients.message({
        type: 'error',
        message: 'You are already in a matchmaking queue',
      }),
    );

  let match = null;

  switch (message.mode) {
    case 'casual':
      if (game.queues.casual !== null) {
        const player1 = game.queues.casual;
        const player2 = client;

        game.queues.casual = null;
        match = new MatchConstructor(server, [player1, player2]);
      } else game.queues.casual = client;
      break;
    case 'ranked':
      server.log.warn('TODO: Handle ranked matchmaking');
      break;
    default:
      return client.socket.send(
        server.clients.message({
          type: 'error',
          message: 'Invalid mode',
        }),
      );
  }

  client.socket.send(
    server.clients.message({
      type: 'success',
      origin: 'joinMatchmaking',
    }),
  );

  match?.start();
}
