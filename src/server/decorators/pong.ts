import {FastifyPluginAsync} from 'fastify';

const plugin: FastifyPluginAsync = async server => {
  server.decorate('pong', {
    matches: {},
    queues: {
      casual: null,
    },
  });
};

export default plugin;
