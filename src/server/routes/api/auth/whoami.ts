import {FastifyPluginAsync} from 'fastify';
import fp from 'fastify-plugin';
import SQL from 'sql-template-strings';

const plugin: FastifyPluginAsync = async server => {
  server.get(
    '/api/auth/whoami',
    {onRequest: server.authenticate},
    async (request, reply) => {
      const {id} = request.user;

      const {username} = await server.db.get(
        SQL`SELECT username FROM users WHERE id = ${id}`,
      );

      return reply.send({id, username});
    },
  );
};

export default fp(plugin);
