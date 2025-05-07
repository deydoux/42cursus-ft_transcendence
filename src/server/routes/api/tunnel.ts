import {FastifyPluginAsync} from 'fastify';

const plugin: FastifyPluginAsync = async server => {
  await server.register(import('@fastify/websocket'));

  server.addHook('onRequest', async request => {
    try {
      await server.authenticate(request);
    } catch (error) {
      if (server.prod) throw error;
      server.log.warn('Authentication failed', error);
    }
  });

  server.get('/tunnel', {websocket: true}, server.clients.handler);
};

export default plugin;
