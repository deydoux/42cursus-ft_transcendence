import {FastifyPluginAsync} from 'fastify';

const plugin: FastifyPluginAsync = async server => {
  server.decorate('getUserStatus', id => {
    const player = server.game.players[id];
    if (player) return player.game;

    if (server.clients.isUserOnline(id)) return 'online';

    return null;
  });
};

export default plugin;
