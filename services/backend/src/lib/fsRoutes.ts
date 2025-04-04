import {FastifyInstance} from 'fastify';
import {dirname, join} from 'node:path';
import {readdirSync} from 'node:fs';

type Options = {
  path?: string;
  prefix?: string;
};

export default function fsRoutes(server: FastifyInstance, options: Options) {
  const {prefix = '/api'} = options;

  let {path} = options;

  if (!path) {
    const filename = require.main?.filename;
    if (!filename) throw new Error('Cannot determine main module filename');
    path = join(dirname(filename), 'api');
    server.log.debug(`fsRoutes base path ${path}`);
  }

  const entries = readdirSync(path, {withFileTypes: true});

  entries.forEach(entry => {
    const entryPath = join(path, entry.name);

    if (entry.isDirectory())
      void server.register(fsRoutes, {
        path: entryPath,
        prefix: `${prefix}/${entry.name}`,
      });
    else if (entry.isFile() && entry.name.endsWith('.js')) {
      server.log.debug(
        `Registering ${entry.name.slice(0, -3)} on ${prefix} route`,
      );
      void server.register(import(entryPath), {prefix});
    }
  });
}
