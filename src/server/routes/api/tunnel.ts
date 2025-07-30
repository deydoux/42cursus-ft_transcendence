import {FastifyPluginAsync} from 'fastify';

const plugin: FastifyPluginAsync = async server => {
  await server.register(import('@fastify/websocket'));

  server.addHook('onRequest', async request => {
    if (!request.headers.authorization)
      request.headers.authorization = request.headers['sec-websocket-protocol'];
    await server.authenticate()(request);
  });

  server.get('/tunnel', {websocket: true}, server.clients.routeHandler);
};

export default plugin;
