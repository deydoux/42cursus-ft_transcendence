import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';

const plugin: FastifyPluginAsync = async server => {
  server.post(
    '/logout',
    {onRequest: server.authenticate},
    async (request, reply) => {
      await server.db.run(
        SQL`DELETE FROM connections WHERE id = ${request.connection}`,
      );

      return reply.clearCookie('refreshToken').code(204).send();
    },
  );
};

export default plugin;
