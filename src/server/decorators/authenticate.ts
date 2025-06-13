import {FastifyPluginAsync} from 'fastify';

const plugin: FastifyPluginAsync = async server => {
  server.decorate('authenticate', (scope = '*') => async request => {
    await request.jwtVerify();

    if (request.user.scope !== scope)
      throw server.httpErrors.unauthorized('Invalid token scope');
  });
};

export default plugin;
