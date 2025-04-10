import {createReadStream} from 'node:fs';
import {FastifyPluginAsync} from 'fastify';
import {join} from 'node:path';
import fp from 'fastify-plugin';

const distPath = join(__dirname, '..', '..', 'dist');

const plugin: FastifyPluginAsync = async server => {
  server.get('*', (request, reply) => {
    const {url} = request;
    if (
      url === '/favicon.ico' ||
      url.startsWith('/api') ||
      url.startsWith('/assets')
    )
      return reply.callNotFound();

    const stream = createReadStream(join(distPath, 'index.html'));
    return reply.type('text/html').send(stream);
  });

  void server.register(import('@fastify/static'), {
    root: join(distPath, 'assets'),
    prefix: '/assets/',
  });
};

export default fp(plugin);
