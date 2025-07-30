import {FastifyPluginAsync} from 'fastify';

const plugin: FastifyPluginAsync = async server => {
  await server.register(import('@fastify/websocket'));

  server.addHook('onRequest', async request => {
    const protocol = request.headers['sec-websocket-protocol'];
    if (!request.headers.authorization && protocol)
      request.headers.authorization = protocol;

    await server.authenticate()(request);
  });

  server.get('/tunnel', {websocket: true}, server.clients.routeHandler);
};

export default plugin;
