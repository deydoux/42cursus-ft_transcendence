import {FastifyPluginAsync} from 'fastify';
import Tournaments from '#lib/Tournaments';

const plugin: FastifyPluginAsync = async server => {
  server.decorate('tournaments', new Tournaments(server));
};

export default plugin;
