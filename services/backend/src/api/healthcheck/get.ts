import {FastifyInstance} from 'fastify';

export default function (server: FastifyInstance) {
  server.get('/', async (request, reply) => {
    return reply.send({status: 'healthy'});
  });
}
