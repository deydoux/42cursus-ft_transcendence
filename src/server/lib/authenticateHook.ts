import {FastifyPluginAsync} from 'fastify';

const plugin: FastifyPluginAsync = async server => {
  server.addHook('onRequest', server.authenticate());
};

export default plugin;
