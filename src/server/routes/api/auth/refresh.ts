import {FastifyPluginAsync} from 'fastify';
import fp from 'fastify-plugin';
import SQL from 'sql-template-strings';

const plugin: FastifyPluginAsync = async server => {
  server.post(
    '/api/auth/refresh',
    {onRequest: server.authenticateRefresh},
    async (request, reply) => {
      const accessToken = server.generateAccessToken(request.user.id);
      const {refreshToken} = request.cookies;

      await server.db.run(
        SQL`UPDATE tokens SET access = ${accessToken} WHERE refresh = ${refreshToken}`,
      );

      return reply.send({accessToken}).code(201);
    },
  );
};

export default fp(plugin);
