import {FastifyPluginAsync} from 'fastify';

const plugin: FastifyPluginAsync = async server => {
  server.decorate('game', {
    players: {},
    queues: {
      pong: {
        casual: null,
      },
      race: {
        casual: null,
      },
    },
  });
};

export default plugin;
