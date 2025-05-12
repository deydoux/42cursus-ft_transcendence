import {FastifyPluginAsync} from 'fastify';
import {watch} from 'node:fs';

const plugin: FastifyPluginAsync = async server => {
  if (server.prod) return;

  const path = server.paths.dist;
  watch(path, (eventType, filename) => {
    if (filename !== 'index.html' || eventType !== 'change') return;

    server.clients.broadcast({type: 'hotReload'});
    server.log.trace('Watched dist change');
  });

  server.log.info(`Watching "${path}" dist`);
};

export default plugin;
