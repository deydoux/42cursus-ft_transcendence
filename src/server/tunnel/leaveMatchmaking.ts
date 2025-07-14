import {Client} from '#types/Clients';
import {FastifyInstance} from 'fastify';

export default function leaveMatchmaking(
  server: FastifyInstance,
  client: Client,
) {
  if (server.pong.queues.casual?.userID === client.userID)
    server.pong.queues.casual = null;
}
