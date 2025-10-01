import {FastifyPluginAsync} from 'fastify';

const plugin: FastifyPluginAsync = async server => {
  server.get('/', (_request, reply) => {
    return reply.send(server.tournaments.get());
  });
};

export default plugin;
