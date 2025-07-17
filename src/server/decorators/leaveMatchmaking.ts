import {FastifyPluginAsync} from 'fastify';

const plugin: FastifyPluginAsync = async server => {
  server.decorate('leaveMatchmaking', socket => {
    if (server.game.queues.pong.casual?.socket === socket)
      server.game.queues.pong.casual = null;
    else if (server.game.queues.race.casual?.socket === socket)
      server.game.queues.race.casual = null;
  });
};

export default plugin;
