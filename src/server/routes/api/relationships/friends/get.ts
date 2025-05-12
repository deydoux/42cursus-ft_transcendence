import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';

const plugin: FastifyPluginAsync = async server => {
  server.get('/', async (request, reply) => {
    const {id} = request.user;

    const friends = await server.db.all(
      SQL`SELECT r.id, u.id, u.username, u.avatar
          FROM relationships r
          JOIN users u ON u.id = r.other_id
          WHERE u.id = ${id} AND r.type = 'friend'
          UNION
          SELECT r.id, u.id, u.username, u.avatar
          FROM relationships r
          JOIN users u ON u.id = r.user_id
          WHERE u.id = ${id} AND r.type = 'friend'`,
    );

    return reply.send({friends});
  });
};

export default plugin;
