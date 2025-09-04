import {Client, ClientTunnelMessage} from '#types/Clients';
import Clients from '#lib/Clients';
import {FastifyInstance} from 'fastify';

export default async function joinTournament(
  server: FastifyInstance,
  client: Client,
  message: ClientTunnelMessage & {type: 'joinTournament'},
) {
  const player = server.game.players[client.userID];
  if (player)
    return Clients.sendClient(client, {
      type: 'error',
      message: `You are already in a ${player.match?.game === 'tournament' ? 'tournament' : 'match'}`,
    });
}
