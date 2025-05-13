import {join, resolve} from 'node:path';
import {FastifyPluginAsync} from 'fastify';

let {DATA_PATH} = process.env;

const plugins: FastifyPluginAsync = async server => {
  if (!DATA_PATH) {
    const message = 'DATA_PATH environment variable is not set';

    if (server.prod) throw new Error(message);

    DATA_PATH = 'data';
    server.log.warn(`${message}, using "${DATA_PATH}" as default`);
  }

  const data = resolve(DATA_PATH);
  server.decorate('paths', {
    avatars: join(data, 'avatars'),
    cache: join(data, 'cache'),
    data,
    db: join(data, 'db.sqlite'),
    dist: resolve('dist'),
    static: resolve('static'),
  });
};

export default plugins;
