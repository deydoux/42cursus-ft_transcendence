import {FastifyPluginAsync, FastifyRequest} from 'fastify';

const plugin: FastifyPluginAsync = async server => {
  server.decorate('authenticateRefresh', async (request: FastifyRequest) => {
    await request.jwtVerify({onlyCookie: true});
  });
};

export default plugin;
