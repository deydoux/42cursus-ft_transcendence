import {dirname, join} from 'node:path';
import {FastifyPluginCallback} from 'fastify';
import {readdirSync} from 'node:fs';

interface IOptions {
  path?: string;
  prefix?: string;
}

const fsRoutes: FastifyPluginCallback<IOptions> = (server, options) => {
  if (!options.prefix)
    return void server.register(fsRoutes, {...options, prefix: 'api'});

  let {path} = options;
  if (!path) {
    const filename = require.main?.filename;
    if (!filename) throw new Error('Cannot determine main module filename');
    path = join(dirname(filename), 'api');
    server.log.debug(`fsRoutes root ${path}`);
  } else server.log.debug(`fsRoutes explore ${path}`);

  const entries = readdirSync(path, {withFileTypes: true});
  entries.forEach(entry => {
    const entryPath = join(path, entry.name);

    if (entry.isDirectory())
      void server.register(fsRoutes, {
        path: entryPath,
        prefix: entry.name,
      });
    else if (entry.isFile() && entry.name.endsWith('.js')) {
      server.log.debug(`fsRoutes register ${entryPath}`);
      void server.register(import(entryPath));
    }
  });
};

export default fsRoutes;
