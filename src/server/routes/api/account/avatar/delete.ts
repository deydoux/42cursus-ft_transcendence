import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';

const plugin: FastifyPluginAsync = async server => {
  server.delete('/', async (request, reply) => {
    const {id} = request.user;
    await server.db.run(SQL`
      UPDATE users
      SET has_avatar = FALSE
      WHERE id = ${id}
    `);

    await server.removeAvatar(id);
    return reply.code(204).send();
  });
};

export default plugin;
