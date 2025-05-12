import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';

const plugin: FastifyPluginAsync = async server => {
  server.get('/', async (request, reply) => {
    const {id} = request.user;

    const requests = await server.db.all(
      SQL`SELECT other_id AS id FROM relationships WHERE user_id = ${id} AND type = 'request'`,
    );

    return reply.send({requests});
  });
};

export default plugin;
