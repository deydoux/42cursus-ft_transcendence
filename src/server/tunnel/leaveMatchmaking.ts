import {Client} from '#types/Clients';
import {FastifyInstance} from 'fastify';

export default function leaveMatchmaking(
  server: FastifyInstance,
  client: Client,
  message: {type: 'leaveMatchmaking'},
) {
  if (server.game.queues.pong.casual?.userID === client.userID)
    server.game.queues.pong.casual = null;
  else if (server.game.queues.race.casual?.userID === client.userID)
    server.game.queues.race.casual = null;

  void message;
}
