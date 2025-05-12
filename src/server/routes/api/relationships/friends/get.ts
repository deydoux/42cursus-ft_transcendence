import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';

const plugin: FastifyPluginAsync = async server => {
  server.get('/', async (request, reply) => {
    const {id} = request.user;

    const friends = await server.db.all(
      SQL`SELECT other_id AS id FROM relationships WHERE user_id = ${id} AND type = 'friend'
          UNION
          SELECT user_id AS id FROM relationships WHERE other_id = ${id} AND type = 'friend'`,
    );

    return reply.send({friends});
  });
};

export default plugin;
