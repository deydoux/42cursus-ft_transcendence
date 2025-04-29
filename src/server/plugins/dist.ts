import {FastifyPluginAsync} from 'fastify';
import {createReadStream} from 'node:fs';
import {join} from 'node:path';

const plugin: FastifyPluginAsync = async server => {
  server.get('*', (request, reply) => {
    const {url} = request;
    if (
      url === '/favicon.ico' ||
      url.startsWith('/api') ||
      url.startsWith('/assets')
    )
      return reply.callNotFound();

    const stream = createReadStream(join(server.paths.dist, 'index.html'));
    return reply.type('text/html').send(stream);
  });

  await server.register(import('@fastify/static'), {
    root: join(server.paths.dist, 'assets'),
    prefix: '/assets/',
  });
};

export default plugin;
