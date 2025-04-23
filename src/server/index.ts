import 'dotenv/config';
import Fastify from 'fastify';
import {join} from 'node:path';

const DEV = process.env.NODE_ENV === 'development';
const HOST = process.env.HOST || '0.0.0.0';
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

const server = Fastify({
  ignoreTrailingSlash: true,
  logger: {
    level: DEV ? 'trace' : 'debug',
    transport: {
      target: '@fastify/one-line-logger',
    },
  },
});

server.decorate('dev', DEV);
server.decorate('prod', !DEV);

async function main() {
  await server.register(import('./plugins/db'));
  await server.register(import('@fastify/cookie'), {
    parseOptions: {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      httpOnly: true,
      sameSite: 'strict',
      secure: server.prod,
      path: '/',
    },
  });
  await server.register(import('./plugins/jwt'));
  await server.register(import('./plugins/generateTokens'));
  await server.register(import('@fastify/sensible'));
  await server.register(import('@fastify/websocket'));
  await server.register(import('./plugins/dist'));
  await server.register(import('@fastify/autoload'), {
    dir: join(__dirname, 'routes'),
  });

  await server.listen({host: HOST, port: PORT});
}

void main();
