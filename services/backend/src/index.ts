import fastify from 'fastify';

const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const server = fastify({
  ignoreTrailingSlash: true,
  logger: {
    transport: {
      target: '@fastify/one-line-logger',
    },
  },
});

server.get('/ping', async (request, reply) => {
  return 'pong\n';
});

void server.listen({host: HOST, port: PORT});
