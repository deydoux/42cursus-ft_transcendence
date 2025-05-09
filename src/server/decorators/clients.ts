import Clients from '#lib/Clients';
import {FastifyPluginAsync} from 'fastify';

const plugin: FastifyPluginAsync = async server => {
  server.decorate('clients', new Clients(server));
};

export default plugin;
