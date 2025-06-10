import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import SQL from 'sql-template-strings';
import {idParamsSchema} from '#lib/schemas';

interface QueryParams {
  page: number;
}

const schema = {
  ...idParamsSchema,
  query: {
    type: 'object',
    properties: {
      page: {type: 'integer', minimum: 0, default: 0},
    },
  } as const,
};

const plugin: FastifyPluginAsyncJsonSchemaToTs = async server => {
  server.get('/:id', {schema}, async (request, reply) => {
    const {url, user} = request;
    const page = (request.query as QueryParams).page;

    const other = await server.db.get(SQL`
      SELECT id
      FROM users
      WHERE id = ${request.params.id}
    `);

    if (!other) return reply.notFound('User not found');
    if (user.id === other.id)
      return reply.badRequest('Cannot view messages with yourself');

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
      SELECT sender_id AS senderID, content, created_at AS createdAt
      FROM direct_messages
      WHERE (sender_id = ${user.id} AND recipient_id = ${other.id})
            OR (sender_id = ${other.id} AND recipient_id = ${user.id})
      ORDER BY id DESC
      LIMIT 25 OFFSET ${page * 25}
    `);

    await server.db.run(SQL`
      UPDATE direct_messages
      SET read = TRUE
      WHERE sender_id = ${other.id} AND recipient_id = ${user.id}
            AND read = FALSE
    `);

    const next =
      messages.length !== 25 ? null : `${url.split('?')[0]}?page=${page + 1}`;
    return reply.send({messages, next});
  });
};

export default plugin;
