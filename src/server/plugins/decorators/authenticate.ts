import {FastifyPluginAsync} from 'fastify';

const plugin: FastifyPluginAsync = async server => {
  server.decorate('authenticate', (type = 'access') => async request => {
    await request.jwtVerify();

    if (request.user.type !== type)
      throw server.httpErrors.unauthorized('Invalid token type');
  });
};

export default plugin;
