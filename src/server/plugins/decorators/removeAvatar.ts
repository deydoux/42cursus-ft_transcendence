import {FastifyPluginAsync} from 'fastify';
import {join} from 'node:path';
import {rm} from 'node:fs/promises';

const plugin: FastifyPluginAsync = async server => {
  server.decorate('removeAvatar', id => {
    const path = join(server.paths.avatars, `${id}.webp`);
    return rm(path, {force: true});
  });
};

export default plugin;
