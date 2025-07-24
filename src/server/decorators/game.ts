import {FastifyPluginAsync} from 'fastify';

const plugin: FastifyPluginAsync = async server => {
  server.decorate('game', {
    players: {},
    queues: {
      pong: {
        casual: null,
        ranked: [],
      },
      race: {
        casual: null,
        ranked: [],
      },
    },
  });
};

export default plugin;
