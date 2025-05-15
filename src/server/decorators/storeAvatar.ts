import * as sharp from 'sharp';
import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';
import {join} from 'node:path';
import {rename} from 'node:fs/promises';

let it = 0;

const plugin: FastifyPluginAsync = async server => {
  server.decorate('storeAvatar', async (id, input) => {
    let avatar;
    try {
      avatar = sharp(input);
    } catch (error) {
      throw server.httpErrors.badRequest(
        error instanceof Error ? error.message : String(error),
      );
    }

    const {height, width} = await avatar.metadata().catch(error => {
      throw server.httpErrors.badRequest(error.message);
    });
    const size = Math.min(height ?? 0, width ?? 0, 1024);

    server.log.trace(
      `Resizing avatar from ${width}x${height} to ${size}x${size}`,
    );
    avatar.resize(size, size);

    const cacheFile = join(server.paths.cache, `avatar_${++it}.webp`);
    const avatarFile = join(server.paths.avatars, `${id}.webp`);

    server.log.trace(`Writing avatar to ${cacheFile}`);
    await avatar.toFile(cacheFile);

    server.log.trace(`Renaming avatar to ${avatarFile}`);
    await rename(cacheFile, avatarFile);

    await server.db.run(
      SQL`UPDATE users
          SET has_avatar = TRUE, avatar_version = avatar_version + 1
          WHERE id = ${id}`,
    );
  });
};

export default plugin;
