import {FastifyPluginAsync} from 'fastify';
import {resolve} from 'node:path';

let {DATA_PATH} = process.env;

const plugins: FastifyPluginAsync = async server => {
  if (!DATA_PATH) {
    const message = 'DATA_PATH environment variable is not set';

    if (server.dev) {
      DATA_PATH = 'data';
      server.log.warn(`${message}, using "${DATA_PATH}" as default`);
    } else throw new Error(message);
  }

  server.decorate('paths', {
    data: resolve(DATA_PATH),
    dist: resolve('dist'),
  });
};

export default plugins;
