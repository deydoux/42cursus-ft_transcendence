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

  const player = await server.playerify(client);
  const tournament = server.tournaments.create(message.name, player);

  if (!tournament) return;

  server.clients.broadcast(
    {
      type: 'newTournament',
      tournament: tournament.get(),
    },
    [client.userID],
  );
}
