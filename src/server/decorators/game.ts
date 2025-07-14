import {FastifyPluginAsync} from 'fastify';

const plugin: FastifyPluginAsync = async server => {
  server.decorate('game', {
    matches: [],
    players: [],
    queues: {
      casual: null,
    },
  });
};

export default plugin;
