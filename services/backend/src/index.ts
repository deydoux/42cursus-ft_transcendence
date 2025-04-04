import 'dotenv/config';
import fastify from 'fastify';

const {NODE_ENV} = process.env;
const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const server = fastify({
  ignoreTrailingSlash: true,
  logger: {
    level: NODE_ENV === 'development' ? 'trace' : 'debug',
    transport: {
      target: '@fastify/one-line-logger',
    },
  },
});

void server.register(import('./plugins/jwt'));
void server.register(import('./lib/fsRoutes'));

void server.listen({host: HOST, port: PORT});
