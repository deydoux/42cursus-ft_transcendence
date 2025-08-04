import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';

const plugin: FastifyPluginAsync = async server => {
  server.get('/', async (request, reply) => {
    const {session, user} = request;

    const sessions = await server.db.all(SQL`
      SELECT id, ip, user_agent AS userAgent, created_at AS createdAt,
             updated_at AS updatedAt
      FROM sessions
      WHERE user_id = ${user.id}
      ORDER BY updated_at DESC
    `);

    sessions.forEach(session => {
      session.createdAt = new Date(session.createdAt * 1000);
      session.updatedAt = new Date(session.updatedAt * 1000);
    });

    return reply.send({session, sessions});
  });
};

export default plugin;
