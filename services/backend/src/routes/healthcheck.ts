import {FastifyPluginAsync} from 'fastify';

export default <FastifyPluginAsync>async function (server) {
  server.get('/api/healthcheck', () => ({
    status: 'ok',
    uptime: process.uptime(),
  }));
};
