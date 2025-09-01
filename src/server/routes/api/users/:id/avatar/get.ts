import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import {idParamsSchema as schema} from '#lib/schemas';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async server => {
  if (server.prod)
    await server.register(import('@fastify/static'), {
      root: server.paths.avatars,
    });

  server.setNotFoundHandler((_, reply) =>
    reply.redirect('/static/default_avatar.webp', 302),
  );

  server.get('/', {schema}, async (request, reply) => {
    const {id} = request.params;
    return reply.sendFile(`${id}.webp`, server.paths.avatars);
  });
};

export default plugin;
