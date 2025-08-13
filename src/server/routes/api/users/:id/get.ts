import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import SQL from 'sql-template-strings';
import {idParamsSchema as schema} from '#lib/schemas';
import serializeUserAvatar from '#lib/serializeUserAvatar';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async server => {
  server.get('/', {schema}, async (request, reply) => {
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
};

export default plugin;
