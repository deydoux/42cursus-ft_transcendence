import {FastifyPluginAsync} from 'fastify';
import fp from 'fastify-plugin';

const plugin: FastifyPluginAsync = async server => {
  server.get('/api/healthcheck', () => ({
    status: 'ok',
    uptime: process.uptime(),
  }));
};

export default fp(plugin);
