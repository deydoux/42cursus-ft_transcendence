import {FastifyPluginAsync} from 'fastify';

const plugin: FastifyPluginAsync = async server => {
  server.decorate('authenticate', async request => {
    await request.jwtVerify();
  });
};

export default plugin;
