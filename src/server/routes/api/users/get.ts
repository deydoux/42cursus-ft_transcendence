import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import SQL from 'sql-template-strings';
import {idParamsSchema as schema} from '#lib/schemas';
import serializeUserAvatar from '#lib/serializeUserAvatar';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async server => {
  server.get('/:id', {schema}, async (request, reply) => {
    const {id} = request.params;
    const user = await server.db.get(SQL`
      SELECT id, username, has_avatar, avatar_version
      FROM users
      WHERE id = ${id}
    `);

    if (!user) return reply.notFound('User not found');

    serializeUserAvatar(user);
    return user;
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
