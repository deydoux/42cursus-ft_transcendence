import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';

const plugin: FastifyPluginAsync = async server => {
  server.get('', {onRequest: server.authenticate}, async (request, reply) => {
    const {id} = request.user;
    const connections = (
      await server.db.all(
        SQL`SELECT id, ip, user_agent AS userAgent, created_at AS createdAt, updated_at AS updatedAt FROM connections WHERE user_id = ${id}`,
      )
    )
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .map(connection => ({
        ...connection,
        createdAt: new Date(connection.createdAt * 1000),
        updatedAt: new Date(connection.updatedAt * 1000),
      }));

    return reply.send({currentConnection: request.connection, connections});
  });
};

export default plugin;
