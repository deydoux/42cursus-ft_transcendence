import {FastifyPluginAsync} from 'fastify';

const plugin: FastifyPluginAsync = async server => {
  server.decorate('authenticateRefresh', async request => {
    await request.jwtVerify({onlyCookie: true});
  });
};

export default plugin;
