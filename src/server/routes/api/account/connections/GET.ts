import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';
import fp from 'fastify-plugin';

const plugin: FastifyPluginAsync = async server => {
  server.get(
    '/api/account/connections',
    {onRequest: server.authenticate},
    async (request, reply) => {
      const {id} = request.user;
      const connections = (
        await server.db.all(
          SQL`SELECT id, ip, user_agent AS userAgent, created_at AS createdAt, updated_at AS updatedAt FROM connections WHERE user_id = ${id}`,
        )
      )
        .map(connection => ({
          ...connection,
          createdAt: new Date(connection.createdAt * 1000),
          updatedAt: new Date(connection.updatedAt * 1000),
        }))
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());

      return reply.send({currentConnection: request.connection, connections});
    },
  );
};

export default fp(plugin);
