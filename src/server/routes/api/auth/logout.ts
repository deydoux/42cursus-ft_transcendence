import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';
import fp from 'fastify-plugin';

const plugin: FastifyPluginAsync = async server => {
  server.post(
    '/api/auth/logout',
    {
      onRequest: server.authenticate,
    },
    async (request, reply) => {
      const accessToken = request.headers.authorization?.split(' ')[1];
      const {refreshToken} = request.cookies;

      await server.db.run(
        SQL`DELETE FROM connections WHERE access_token = ${accessToken} OR refresh_token = ${refreshToken}`,
      );

      return reply.clearCookie('refreshToken').code(204).send();
    },
  );
};

export default fp(plugin);
