import {FastifyPluginAsync} from 'fastify';

let it = 0;

const plugin: FastifyPluginAsync = async server => {
  server.decorateRequest('generatePartialToken', async (id: number) =>
    server.jwt.sign({id, type: 'partial', it: ++it}),
  );
};

export default plugin;
