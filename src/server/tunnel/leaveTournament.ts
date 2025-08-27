import {Client} from '#types/Clients';
import {FastifyInstance} from 'fastify';

export default function leaveMatchmaking(
  server: FastifyInstance,
  client: Client,
  message: {type: 'leaveTournament'},
) {
  const player = server.game.players[client.userID];
  if (player?.match?.game !== 'tournament')
    return server.clients.sendUser(client.userID, {
      type: 'error',
      message: 'You are not in a tournament',
    });

  if (player.match.started)
    return server.clients.sendUser(client.userID, {
      type: 'error',
      message: 'You cannot leave a tournament that has started',
    });

  player.match.removeClient(client);

  void message;
}
