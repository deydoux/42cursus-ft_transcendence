import {Client} from '#types/Clients';
import {FastifyInstance} from 'fastify';

export default function leaveMatchmaking(
  server: FastifyInstance,
  client: Client,
  message: object,
) {
  const {mode} = message as {mode: string};

  if (!mode)
    return client.socket.send(
      server.clients.message({type: 'error', message: 'Mode is required'}),
    );

  switch (mode) {
    case 'casual':
      if (server.pong.queues.casual?.socket === client.socket)
        server.pong.queues.casual = null;
      break;
    default:
      return client.socket.send(
        server.clients.message({type: 'error', message: 'Invalid mode'}),
      );
  }

  client.socket.send(
    server.clients.message({
      type: 'success',
      origin: 'leaveMatchmaking',
    }),
  );
}
