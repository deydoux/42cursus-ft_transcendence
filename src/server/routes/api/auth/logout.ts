import {FastifyPluginAsync} from 'fastify';
import fp from 'fastify-plugin';
import SQL from 'sql-template-strings';

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
        SQL`DELETE FROM tokens WHERE access = ${accessToken} OR refresh = ${refreshToken}`,
      );

      return reply.clearCookie('refreshToken').code(204).send();
    },
  );
};

export default fp(plugin);
