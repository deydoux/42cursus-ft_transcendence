import {FastifyPluginAsync} from 'fastify';

const plugin: FastifyPluginAsync = async server => {
  server.get('/healthcheck', () => ({
    status: 'ok',
    uptime: process.uptime(),
  }));
};

export default plugin;
