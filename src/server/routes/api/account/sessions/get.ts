import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';
import {UAParser} from 'ua-parser-js';

const plugin: FastifyPluginAsync = async server => {
  server.get('/', async (request, reply) => {
    const {session, user} = request;

    const sessions = await server.db.all(SQL`
      SELECT id, user_agent AS userAgent, created_at AS createdAt,
             updated_at AS updatedAt
      FROM sessions
      WHERE user_id = ${user.id}
      ORDER BY updated_at DESC
    `);

    sessions.forEach(session => {
      session.userAgent = new UAParser(session.userAgent || '').getResult();
      session.createdAt = new Date(session.createdAt * 1000);
      session.updatedAt = new Date(session.updatedAt * 1000);
    });

    return reply.send({session, sessions});
  });
};

export default plugin;
