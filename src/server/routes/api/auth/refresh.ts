import {FastifyPluginAsync} from 'fastify';

const plugin: FastifyPluginAsync = async server => {
  server.addHook('onRequest', server.authenticateRefresh);

  server.post('/refresh', async (request, reply) => {
    const accessToken = await request.generateAccessToken(request.user.id);

    return reply.send({accessToken}).code(201);
  });
};

export default plugin;
