import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';
import {join} from 'node:path';
import {unlink} from 'node:fs/promises';

const plugin: FastifyPluginAsync = async server => {
  server.delete('/', async (request, reply) => {
    const {id} = request.user;
    await server.db.run(
      SQL`UPDATE users SET has_avatar = FALSE WHERE id = ${id}`,
    );

    const path = join(server.paths.avatars, `${id}.webp`);
    await unlink(path).catch(error => {
      if (error.code !== 'ENOENT') throw error;
    });

    return reply.code(204).send();
  });
};

export default plugin;
