import {FastifyPluginAsync} from 'fastify';

const plugin: FastifyPluginAsync = async server => {
  server.addHook('onRequest', server.authenticateRefresh);

  server.post('/logout', async (request, reply) => {
    await request.removesession();
    return reply.clearCookie('refreshToken').code(204).send();
  });
};

export default plugin;
