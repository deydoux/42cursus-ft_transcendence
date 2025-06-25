import {Client} from '#types/Clients';
import {FastifyInstance} from 'fastify';

export default function joinMatchmaking(
  server: FastifyInstance,
  client: Client,
  message: object,
) {
  const {mode} = message as {mode: string};

  if (!mode)
    return client.socket.send(
      server.clients.message({type: 'error', message: 'Mode is required'}),
    );

  if (server.queues.casual?.userID === client.userID)
    return client.socket.send(
      server.clients.message({
        type: 'error',
        message: 'You are already in a matchmaking queue',
      }),
    );

  switch (mode) {
    case 'casual':
      if (server.queues.casual !== null) {
        // Create a new match
        server.queues.casual = null;
      } else {
        server.queues.casual = client;
      }
      break;
    default:
      return client.socket.send(
        server.clients.message({type: 'error', message: 'Invalid mode'}),
      );
  }
}
