import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';

const plugin: FastifyPluginAsync = async server => {
  server.get('/', async (request, reply) => {
    const {id} = request.user;

    const friends = await server.db.all(
      SQL`SELECT id, other_id AS userID FROM relationships WHERE user_id = ${id} AND type = 'friend'
          UNION
          SELECT id, user_id AS userID FROM relationships WHERE other_id = ${id} AND type = 'friend'`,
    );

    return reply.send({friends});
  });
};

export default plugin;
