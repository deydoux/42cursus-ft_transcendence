import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import SQL from 'sql-template-strings';
import generateAvatarURL from '#lib/generateAvatarURL';

const schema = {
  params: {
    type: 'object',
    properties: {
      id: {type: 'number'},
    },
    required: ['id'],
  } as const,
};

const plugin: FastifyPluginAsyncJsonSchemaToTs = async server => {
  server.get('/:id', {schema}, async (request, reply) => {
    const {id} = request.params;
    const user = await server.db.get(
      SQL`SELECT id, username, has_avatar, avatar_version FROM users WHERE id = ${id}`,
    );

    if (!user) return reply.notFound('User not found');

    generateAvatarURL(user);
    return {...user, online: server.clients.isOnline(id)};
  });

  await server.register((async instance => {
    instance.setNotFoundHandler((_, reply) =>
      reply.redirect('/static/default_avatar.webp', 302),
    );

    instance.get('/:id/avatar', {schema}, async (request, reply) => {
      const {id} = request.params;
      return reply.sendFile(`${id}.webp`, server.paths.avatars);
    });
  }) as FastifyPluginAsyncJsonSchemaToTs);
};

export default plugin;
