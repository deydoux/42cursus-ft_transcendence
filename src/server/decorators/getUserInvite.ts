import {FastifyPluginAsync} from 'fastify';

const plugin: FastifyPluginAsync = async server => {
  server.decorate('getUserInvite', (user, other) => {
    for (const [game, queue] of Object.entries(server.game.queues))
      if (
        queue.invites.some(
          invite => invite.client.userID === other && invite.other === user,
        )
      )
        return game;

    return null;
  });
};

export default plugin;
