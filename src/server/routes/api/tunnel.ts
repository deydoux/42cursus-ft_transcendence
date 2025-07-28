import {FastifyPluginAsync} from 'fastify';

const plugin: FastifyPluginAsync = async server => {
  await server.register(import('@fastify/websocket'));

  server.addHook('onRequest', server.authenticate());

  server.get('/tunnel', {websocket: true}, server.clients.routeHandler);
};

export default plugin;
