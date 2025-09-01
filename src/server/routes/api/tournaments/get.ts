import {FastifyPluginAsync} from 'fastify';

const plugin: FastifyPluginAsync = async server => {
  server.get('/', async (request, reply) => {});
};

export default plugin;
