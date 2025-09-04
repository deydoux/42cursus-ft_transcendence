import {Client, ClientTunnelMessage} from '#types/Clients';
import {FastifyInstance} from 'fastify';

export default async function joinTournament(
  server: FastifyInstance,
  client: Client,
  message: ClientTunnelMessage & {type: 'joinTournament'},
) {}
