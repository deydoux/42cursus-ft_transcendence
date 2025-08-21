import {FastifyPluginAsync} from 'fastify';
import {WebSocket} from '@fastify/websocket';

const plugin: FastifyPluginAsync = async server => {
  const leaveMatchmakingGame = (game: 'pong' | 'race', socket: WebSocket) => {
    const queue = server.game.queues[game];

    if (queue.casual?.socket === socket) {
      queue.casual = null;
      return;
    }

    queue.invites = queue.invites.filter(
      invite => invite.client.socket !== socket,
    );

    queue.ranked = queue.ranked.filter(client => {
      if (client.socket !== socket) return true;

      clearInterval(client.timeout);
      return false;
    });
  };

  server.decorate('leaveMatchmaking', socket => {
    leaveMatchmakingGame('pong', socket);
    leaveMatchmakingGame('race', socket);
  });
};

export default plugin;
