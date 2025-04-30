import * as sharp from 'sharp';
import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';
import {join} from 'node:path';
import {rename} from 'node:fs/promises';

const plugin: FastifyPluginAsync = async server => {
  let it = 0;

  await server.register(import('@fastify/multipart'), {
    limits: {
      files: 1,
      fields: 0,
      fileSize: 5 * 1024 * 1024, // 5MB
    },
  });

  server.put('/avatar', async (request, reply) => {
    const data = await request.file();
    if (!data) return reply.badRequest('No file uploaded');

    if (!data.mimetype.startsWith('image/'))
      return reply.unsupportedMediaType('File type not supported');

    if (data.file.truncated)
      throw {
        ...server.multipartErrors.FilesLimitError(),
        message: 'File too large (max 5MB)',
      };

    const buffer = await data.toBuffer();

    let avatar;
    try {
      avatar = sharp(buffer);
    } catch (error) {
      throw server.httpErrors.badRequest(
        error instanceof Error ? error.message : String(error),
      );
    }

    const {height, width} = await avatar.metadata().catch(error => {
      throw server.httpErrors.badRequest(error.message);
    });
    const size = Math.min(height ?? 0, width ?? 0, 1024);
    avatar.resize(size, size);

    const cacheFile = join(server.paths.cache, `avatar_${++it}.webp`);
    const avatarFile = join(server.paths.avatars, `${request.user.id}.webp`);
    await avatar.toFile(cacheFile);
    await rename(cacheFile, avatarFile);

    const {id} = request.user;
    server.db.run(
      SQL`UPDATE users SET avatar_version = avatar_version + 1 WHERE id = ${id}`,
    );

    return reply.code(204).send();
  });
};

export default plugin;
