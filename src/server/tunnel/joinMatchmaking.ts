import Match from '#lib/Match';
import {Client} from '#types/Clients';
import {FastifyInstance} from 'fastify';

export default function joinMatchmaking(
  server: FastifyInstance,
  client: Client,
  message: object,
) {
  const {clients, pong} = server;
  const {mode} = message as {mode: string};

  if (!mode)
    return client.socket.send(
      server.clients.message({
        type: 'error',
        message: 'Mode is required',
        origin: 'joinMatchmaking',
      }),
    );

  if (server.pong.queues.casual?.userID === client.userID)
    return client.socket.send(
      clients.message({
        type: 'error',
        message: 'You are already in a matchmaking queue',
        origin: 'joinMatchmaking',
      }),
    );

  switch (mode) {
    case 'casual':
      if (server.pong.queues.casual !== null) {
        const player1 = server.pong.queues.casual;
        const player2 = client;

        pong.queues.casual = null;
        pong.matches.push(new Match(server, player1, player2));
      } else pong.queues.casual = client;
      break;
    default:
      return client.socket.send(
        server.clients.message({
          type: 'error',
          message: 'Invalid mode',
          origin: 'joinMatchmaking',
        }),
      );
  }
}
