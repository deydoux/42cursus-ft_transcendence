import {FastifyPluginAsync} from 'fastify';

const plugin: FastifyPluginAsync = async server => {
  server.decorate('game', {
    players: {},
    queues: {
      casual: null,
    },
  });
};

export default plugin;
