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
    const otherID = request.params.id;
    const page = (request.query as QueryParams).page;

    const messages = await server.db.all(SQL`
      SELECT sender_id AS senderID, content, created_at AS createdAt
      FROM direct_messages
      WHERE (sender_id = ${user.id} AND recipient_id = ${otherID})
            OR (sender_id = ${otherID} AND recipient_id = ${user.id})
      ORDER BY created_at DESC
      LIMIT 25 OFFSET ${page * 25}
    `);

    await server.db.run(SQL`
      UPDATE direct_messages
      SET read = TRUE
      WHERE sender_id = ${otherID} AND recipient_id = ${user.id}
            AND read = FALSE
    `);

    const next =
      messages.length !== 25 ? null : `${url.split('?')[0]}?page=${page + 1}`;
    return reply.send({messages, next});
  });
};

export default plugin;
