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
      SQL`SELECT id, username, avatar_version FROM users WHERE id = ${id}`,
    );

    if (!user) return reply.notFound('User not found');

    generateAvatarURL(user);
    return user;
  });

  server.get('/:id/avatar', {schema}, async (request, reply) => {
    const {id} = request.params;
    const user = await server.db.get(
      SQL`SELECT avatar_version FROM users WHERE id = ${id}`,
    );

    if (!user) return reply.notFound('User not found');
    if (!user.avatar_version)
      return reply.redirect('/static/default_avatar.webp', 302);

    return reply.sendFile(`${id}.webp`, server.paths.avatars);
  });
};

export default plugin;
