import Clients from '#lib/Clients';
import {FastifyPluginAsync} from 'fastify';

const plugin: FastifyPluginAsync = async server => {
  server.decorate('playAvailability', client => {
    const {game} = server;

    const player = game.players[client.userID];
    if (player) {
      if (player.match?.game === 'tournament')
        throw Clients.sendClient(client, {
          type: 'error',
          message: 'You are already in a tournament',
        });
      else
        throw Clients.sendClient(client, {
          type: 'error',
          message: 'You are already playing a match',
        });
    }

    for (const queue of Object.values(game.queues)) {
      if (
        queue.casual?.userID === client.userID ||
        queue.invites.some(invite => invite.client.userID === client.userID) ||
        queue.ranked.some(rankedClient => rankedClient.userID === client.userID)
      )
        throw Clients.sendClient(client, {
          type: 'error',
          message: 'You are already in a matchmaking queue',
        });
    }
  });
};

export default plugin;
