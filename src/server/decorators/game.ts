import {FastifyPluginAsync} from 'fastify';

const plugin: FastifyPluginAsync = async server => {
  server.decorate('game', {
    players: {},
    queues: {
      pong: {
        casual: null,
        invites: [],
        ranked: [],
      },
      race: {
        casual: null,
        invites: [],
        ranked: [],
      },
    },
  });
};

export default plugin;
