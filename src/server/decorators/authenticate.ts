import {FastifyPluginAsync, FastifyRequest} from 'fastify';

const plugin: FastifyPluginAsync = async server => {
  server.decorate('authenticate', async (request: FastifyRequest) => {
    await request.jwtVerify();
  });
};

export default plugin;
