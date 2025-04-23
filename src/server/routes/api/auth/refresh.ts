import {FastifyPluginAsync} from 'fastify';
import fp from 'fastify-plugin';

const plugin: FastifyPluginAsync = async server => {
  server.post(
    '/api/auth/refresh',
    {onRequest: server.authenticateRefresh},
    async (request, reply) => {
      const accessToken = await request.generateAccessToken(
        request.user.id,
        request.cookies.refreshToken,
      );

      return reply.send({accessToken}).code(201);
    },
  );
};

export default fp(plugin);
