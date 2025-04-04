import {FastifyInstance} from 'fastify';

export default function (server: FastifyInstance) {
  server.get('/', (request, reply) => {
    void reply.send({message: 'Hello from the test route!'});
  });
}
