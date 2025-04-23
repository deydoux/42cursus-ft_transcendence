import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';
import fp from 'fastify-plugin';

const plugin: FastifyPluginAsync = async server => {
  server.get(
    '/api/account/connections',
    {onRequest: server.authenticate},
    async (request, reply) => {
      const {id} = request.user;
      const connections = await server.db.all(
        SQL`SELECT id, ip, user_agent AS userAgent, created_at AS createdAt, updated_at AS updatedAt FROM connections WHERE user_id = ${id}`,
      );

      return reply.send({currentConnection: request.connection, connections});
    },
  );
};

export default fp(plugin);
