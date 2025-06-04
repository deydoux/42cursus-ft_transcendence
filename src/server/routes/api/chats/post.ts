import serializeUserAvatar from '#lib/serializeUserAvatar';
import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import {serialize} from 'node:v8';
import SQL from 'sql-template-strings';

const schema = {
  body: {
    type: 'object',
    properties: {
      recipientID: {type: 'string'},
      message: {type: 'string'},
    },
    required: ['recipientID', 'message'],
  } as const,
};

const plugin: FastifyPluginAsyncJsonSchemaToTs = async server => {
  server.post('/', {schema}, async (request, reply) => {
    const sender = await server.db.get(SQL`
      SELECT id, username, has_avatar, avatar_version
      FROM users
      WHERE id = ${request.user.id}
    `);
    serializeUserAvatar(sender);

    const recipient = await server.db.get(SQL`
      SELECT id
      FROM users
      WHERE id = ${request.body.recipientID}
    `);

    if (!recipient) return reply.notFound('User not found');
    if (sender.id === recipient.id)
      return reply.badRequest('Cannot send message to yourself');

    const relationship = await server.db.get(SQL`
      SELECT type
      FROM relationships
      WHERE user_id = ${sender.id} AND other_id = ${recipient.id}
    `);

    if (relationship?.type === 'block')
      return reply.conflict('You have blocked this user');

    const otherRelationship = await server.db.get(SQL`
      SELECT type
      FROM relationships
      WHERE user_id = ${recipient.id} AND other_id = ${sender.id}
    `);

    if (otherRelationship?.type === 'block')
      return reply.notFound('User not found');

    if (relationship?.type !== 'friend' && otherRelationship?.type !== 'friend')
      return reply.badRequest('You can only send messages to friends');
  });
};

export default plugin;
