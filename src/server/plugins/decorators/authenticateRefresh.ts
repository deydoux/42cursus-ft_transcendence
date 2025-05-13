import {FastifyPluginAsync} from 'fastify';

const plugin: FastifyPluginAsync = async server => {
  server.decorate('authenticateRefresh', async request => {
    await request.jwtVerify({onlyCookie: true});

    if (request.user.type !== 'refresh')
      throw server.httpErrors.unauthorized('Invalid token type');
  });
};

export default plugin;
