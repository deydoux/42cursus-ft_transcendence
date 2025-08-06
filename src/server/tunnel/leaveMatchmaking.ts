import {Client} from '#types/Clients';
import {FastifyInstance} from 'fastify';

export default function leaveMatchmaking(
  server: FastifyInstance,
  client: Client,
  message: {type: 'leaveMatchmaking'},
) {
  server.leaveMatchmaking(client.socket);
  server.clients.sendUser(client.userID, {
    type: 'success',
    origin: 'leaveMatchmaking',
  });

  void message;
}
