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

  const name = message.name.trim();
  if (name.length < 3 || name.length > 64)
    return Clients.sendClient(client, {
      type: 'error',
      message: 'Tournament name must be between 3 and 64 characters',
    });

  server.tournaments.create(name, client);

  Clients.sendClient(client, {
    type: 'success',
    origin: 'createTournament',
  });
}
