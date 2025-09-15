import {Client, ClientTunnelMessage} from '#types/Clients';
import Clients from '#lib/Clients';
import {FastifyInstance} from 'fastify';

export default async function createTournament(
  server: FastifyInstance,
  client: Client,
  message: ClientTunnelMessage & {type: 'createTournament'},
) {
  if (typeof message.name !== 'string')
    return Clients.sendClient(client, {
      type: 'error',
      message: 'Invalid tournament name',
    });

  server.tournaments.create(message.name, client);
}
