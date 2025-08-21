import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import SQL from 'sql-template-strings';
import {idParamsSchema as schema} from '#lib/schemas';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async server => {
  server.patch('/', {schema}, async (request, reply) => {
    const {user} = request;

    const other = await server.db.get(SQL`
      SELECT id
      FROM users
      WHERE id = ${request.params.id}
    `);

    if (!other) return reply.notFound('User not found');
    if (user.id === other.id)
      return reply.badRequest('Cannot mark messages with yourself as read');

    const relationship = await server.db.get(SQL`
      SELECT type
      FROM relationships
      WHERE user_id = ${user.id} AND other_id = ${other.id}
    `);

    if (relationship?.type === 'block')
      return reply.conflict('You have blocked this user');

    const otherRelationship = await server.db.get(SQL`
      SELECT type
      FROM relationships
      WHERE user_id = ${other.id} AND other_id = ${user.id}
    `);

    if (otherRelationship?.type === 'block')
      return reply.notFound('User not found');

    if (
      relationship?.type !== 'friend' &&
      otherRelationship?.type !== 'friend' &&
      server.game.players[user.id]?.opponent !== other.id
    )
      return reply.badRequest(
        'You can only mark messages with friends as read',
      );

    await server.db.run(SQL`
      UPDATE direct_messages
      SET read = TRUE
      WHERE sender_id = ${other.id} AND recipient_id = ${user.id}
            AND read = FALSE
    `);

    return reply.code(204).send();
  });
};

export default plugin;
