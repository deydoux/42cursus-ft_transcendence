import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';

const plugin: FastifyPluginAsync = async server => {
  server.delete('', async (request, reply) => {
    await server.db.run(
      SQL`DELETE FROM connections WHERE id != ${request.connection} AND user_id = ${request.user.id}`,
    );

    return reply.code(204).send();
  });
};

export default plugin;
