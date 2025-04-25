import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';
import fp from 'fastify-plugin';

const plugin: FastifyPluginAsync = async server => {
  server.post(
    '/api/auth/logout',
    {onRequest: server.authenticate},
    async (request, reply) => {
      await server.db.run(
        SQL`DELETE FROM connections WHERE id = ${request.connection}`,
      );

      return reply.clearCookie('refreshToken').code(204).send();
    },
  );
};

export default fp(plugin);
