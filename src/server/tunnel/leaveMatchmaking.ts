import {Client} from '#types/Clients';
import {FastifyInstance} from 'fastify';

export default function leaveMatchmaking(
  server: FastifyInstance,
  client: Client,
) {
  if (server.game.queues.casual?.userID === client.userID)
    server.game.queues.casual = null;
}
