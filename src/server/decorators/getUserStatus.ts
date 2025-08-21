import {FastifyPluginAsync} from 'fastify';

const plugin: FastifyPluginAsync = async server => {
  server.decorate('getUserStatus', id => {
    const player = server.game.players[id];
    if (player?.match) return player.match.game;

    if (server.clients.isUserOnline(id)) return 'online';

    return null;
  });
};

export default plugin;
