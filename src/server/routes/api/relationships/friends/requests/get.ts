import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';

const plugin: FastifyPluginAsync = async server => {
  server.get('/', async (request, reply) => {
    const {id} = request.user;

    const incoming = await server.db.all(
      SQL`SELECT other_id AS id FROM relationships WHERE user_id = ${id} AND type = 'pending'`,
    );

    const outgoing = await server.db.all(
      SQL`SELECT user_id AS id FROM relationships WHERE other_id = ${id} AND type = 'pending'`,
    );

    return reply.send({incoming, outgoing});
  });
};

export default plugin;
