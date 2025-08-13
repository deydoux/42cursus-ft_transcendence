import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import SQL from 'sql-template-strings';
import {idParamsSchema} from '#lib/schemas';
import serializeUserAvatar from '#lib/serializeUserAvatar';

const PAGE_SIZE = 50;

const schema = {
  ...idParamsSchema,
  querystring: {
    type: 'object',
    properties: {
      lastID: {type: 'integer', default: 0},
    },
  } as const,
};

const plugin: FastifyPluginAsyncJsonSchemaToTs = async server => {
  server.get('/', {schema}, async (request, reply) => {
    const {url, user} = request;
    const {lastID} = request.query;

    const other = await server.db.get(SQL`
      SELECT id, username, last_seen AS lastSeen, has_avatar, avatar_version
      FROM users
      WHERE id = ${request.params.id}
    `);

    if (!other) return reply.notFound('User not found');
    if (user.id === other.id)
      return reply.badRequest('Cannot view messages with yourself');

    serializeUserAvatar(other);
    other.lastSeen = new Date(other.lastSeen * 1000);
    other.online = server.clients.isUserOnline(other.id);

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

    if (relationship?.type !== 'friend' && otherRelationship?.type !== 'friend')
      return reply.badRequest('You can only view messages with friends');

    const messages = await server.db.all(SQL`
      SELECT id, sender_id AS senderID, content, created_at AS createdAt
      FROM direct_messages
      WHERE (${lastID} = 0 OR id < ${lastID}) AND (
        (sender_id = ${user.id} AND recipient_id = ${other.id})
        OR (sender_id = ${other.id} AND recipient_id = ${user.id})
      )
      ORDER BY id DESC
      LIMIT ${PAGE_SIZE}
    `);

    messages.forEach(message => {
      message.createdAt = new Date(message.createdAt * 1000);
    });

    // Mark received messages as read
    await server.db.run(SQL`
      UPDATE direct_messages
      SET read = TRUE
      WHERE sender_id = ${other.id} AND recipient_id = ${user.id}
            AND read = FALSE
    `);

    const next =
      messages.length !== PAGE_SIZE
        ? null
        : `${url.split('?')[0]}?lastID=${messages[PAGE_SIZE - 1].id}`;

    return reply.send({user: other, messages, next});
  });
};

export default plugin;
