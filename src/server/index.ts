import 'dotenv/config';
import {join} from 'node:path';
import Fastify from 'fastify';

const {NODE_ENV} = process.env;
const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const server = Fastify({
  ignoreTrailingSlash: true,
  logger: {
    level: NODE_ENV === 'development' ? 'trace' : 'debug',
    transport: {
      target: '@fastify/one-line-logger',
    },
  },
});

void server.register(import('./plugins/dist'));
void server.register(import('./plugins/db'));
void server.register(import('./plugins/jwt'));

void server.register(import('@fastify/autoload'), {
  dir: join(__dirname, 'routes'),
});

void server.listen({host: HOST, port: PORT});
