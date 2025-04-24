import {FastifyPluginAsync} from 'fastify';

const plugin: FastifyPluginAsync = async server => {
  server.post(
    '',
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

export default plugin;
