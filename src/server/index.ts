import Clients from '#lib/Clients';
import Fastify from 'fastify';
import autoload from '@fastify/autoload';
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

server.decorate('clients', new Clients());
server.decorate('dev', DEV);
server.decorate('prod', !DEV);

async function main() {
  await server.register(import('@fastify/cookie'), {
    parseOptions: {
      maxAge: 30 * 24 * 60 * 60, // 30 days
      httpOnly: true,
      sameSite: 'strict',
      secure: server.prod,
      path: '/',
    },
  });

  await server.register(import('@fastify/sensible'));

  await server.register(autoload, {
    dir: join(__dirname, 'decorators'),
    encapsulate: false,
  });

  await server.register(autoload, {
    dir: join(__dirname, 'plugins'),
    encapsulate: false,
  });

  await server.register(autoload, {
    dir: join(__dirname, 'routes'),
    autoHooks: true,
    cascadeHooks: true,
    routeParams: true,
  });

  await server.listen({host: HOST, port: PORT});
}

void main();
