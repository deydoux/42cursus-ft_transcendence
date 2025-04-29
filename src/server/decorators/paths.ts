import {join, resolve} from 'node:path';
import {FastifyPluginAsync} from 'fastify';

let {DATA_PATH} = process.env;

const plugins: FastifyPluginAsync = async server => {
  if (!DATA_PATH) {
    const message = 'DATA_PATH environment variable is not set';

    if (server.dev) {
      DATA_PATH = 'data';
      server.log.warn(`${message}, using "${DATA_PATH}" as default`);
    } else throw new Error(message);
  }

  const data = resolve(DATA_PATH);
  server.decorate('paths', {
    avatars: join(data, 'avatars'),
    cache: join(data, 'cache'),
    data,
    db: join(data, 'db.sqlite'),
    dist: resolve('dist'),
  });
};

export default plugins;
