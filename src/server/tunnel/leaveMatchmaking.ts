import {Client} from '#types/Clients';
import {FastifyInstance} from 'fastify';

export default function leaveMatchmaking(
  server: FastifyInstance,
  client: Client,
  message: {type: 'leaveMatchmaking'},
) {
  server.leaveMatchmaking(client.socket);
  void message;
}
