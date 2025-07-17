import {FastifyPluginAsync} from 'fastify';

const plugin: FastifyPluginAsync = async server => {
  server.decorate('leaveMatchmaking', socket => {
    if (server.game.queues.pong.casual?.socket === socket)
      server.game.queues.pong.casual = null;
  });
};

export default plugin;
