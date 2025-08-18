import {FastifyPluginAsync} from 'fastify';
import fastifyStatic from '@fastify/static';
import {join} from 'node:path';

const plugin: FastifyPluginAsync = async server => {
  if (server.prod) return;

  await server.register(fastifyStatic, {
    root: join(server.paths.dist, 'assets'),
    prefix: '/assets/',
  });

  await server.register(fastifyStatic, {
    root: server.paths.static,
    prefix: '/static/',
    decorateReply: false,
  });

  server.get('*', (request, reply) => {
    const {url} = request;
    if (
      url === '/favicon.ico' ||
      url.startsWith('/api') ||
      url.startsWith('/assets')
    )
      return reply.callNotFound();

    return reply.sendFile('index.html', server.paths.dist);
  });
};

export default plugin;
