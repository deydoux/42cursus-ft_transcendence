import {FastifyPluginAsync} from 'fastify';

const plugin: FastifyPluginAsync = async server => {
  server.decorate('getUserStatus', id => {
    if (server.clients.isUserOnline(id)) return 'online';
    return null;
  });
};

export default plugin;
