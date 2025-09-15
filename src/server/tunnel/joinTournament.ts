import {Client, ClientTunnelMessage} from '#types/Clients';
import Clients from '#lib/Clients';
import {FastifyInstance} from 'fastify';

export default async function joinTournament(
  server: FastifyInstance,
  client: Client,
  message: ClientTunnelMessage & {type: 'joinTournament'},
) {
  if (typeof message.tournamentID !== 'number')
    return Clients.sendClient(client, {
      type: 'error',
      message: 'Invalid tournament ID',
    });

  server.tournaments.join(message.tournamentID, client);
}
