import {FastifyPluginAsync} from 'fastify';

const plugin: FastifyPluginAsync = async server => {
  server.addHook('onRequest', server.authenticateRefresh);
};

export default plugin;
