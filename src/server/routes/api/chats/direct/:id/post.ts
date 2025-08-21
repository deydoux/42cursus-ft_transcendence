import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import SQL from 'sql-template-strings';
import {idParamsSchema} from '#lib/schemas';
import serializeUserAvatar from '#lib/serializeUserAvatar';

const schema = {
  ...idParamsSchema,
  body: {
    type: 'object',
    properties: {
      content: {type: 'string'},
    },
    required: ['content'],
  } as const,
};

const plugin: FastifyPluginAsyncJsonSchemaToTs = async server => {
  server.post('/', {schema}, async (request, reply) => {
    const content = request.body.content.trim();
    if (content.length === 0)
      return reply.badRequest('Message content cannot be empty');
    if (content.length > 4096)
      return reply.badRequest('Message content cannot exceed 4096 characters');

    const sender = await server.db.get(SQL`
      SELECT id, username, has_avatar, avatar_version
      FROM users
      WHERE id = ${request.user.id}
    `);
    serializeUserAvatar(sender);

    const recipient = await server.db.get(SQL`
      SELECT id
      FROM users
      WHERE id = ${request.params.id}
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

    if (
      relationship?.type !== 'friend' &&
      otherRelationship?.type !== 'friend' &&
      server.game.players[sender.id]?.opponent !== recipient.id
    )
      return reply.badRequest('You can only send messages to friends');

    await server.db.run(SQL`
      INSERT INTO direct_messages(sender_id, recipient_id, content)
      VALUES(${sender.id}, ${recipient.id}, ${content})
    `);

    server.clients.sendUser(recipient.id, {
      type: 'directMessage',
      sender,
      content,
    });

    return reply.code(204).send();
  });
};

export default plugin;
