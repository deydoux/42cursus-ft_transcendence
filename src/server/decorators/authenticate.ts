import {FastifyPluginAsync} from 'fastify';

const plugin: FastifyPluginAsync = async server => {
  server.decorate('authenticate', async request => {
    await request.jwtVerify();

    if (request.user.type !== 'access')
      throw server.httpErrors.unauthorized('Invalid token type');
  });
};

export default plugin;
