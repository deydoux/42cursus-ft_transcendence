import {Client, ClientTunnelMessage} from '#types/Clients';
import {FastifyInstance} from 'fastify';

export default async function createTournament(
  server: FastifyInstance,
  client: Client,
  message: ClientTunnelMessage & {type: 'createTournament'},
) {}
