import {Client} from '#types/Clients';
import {FastifyInstance} from 'fastify';
import Match from '#lib/Match';

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
      }),
    );

  if (server.players.includes(client.userID))
    return client.socket.send(
      clients.message({
        type: 'error',
        message: 'You are already playing a match',
      }),
    );

  if (server.pong.queues.casual?.userID === client.userID)
    return client.socket.send(
      clients.message({
        type: 'error',
        message: 'You are already in a matchmaking queue',
      }),
    );

  let match = null;

  switch (mode) {
    case 'casual':
      if (server.pong.queues.casual !== null) {
        const player1 = server.pong.queues.casual;
        const player2 = client;

        pong.queues.casual = null;
        match = new Match(server, player1, player2);
      } else pong.queues.casual = client;
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
