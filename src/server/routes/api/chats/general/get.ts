import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import SQL from 'sql-template-strings';

const PAGE_SIZE = 50;

const schema = {
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

    const messages = await server.db.all(SQL`
      SELECT id, sender_id AS senderID, content, created_at AS createdAt
      FROM direct_messages
      WHERE (${lastID} = 0 OR id < ${lastID}) AND NOT EXISTS (
              SELECT NULL
              FROM relationships
              WHERE type = 'block' AND (
                      (user_id = ${user.id} AND other_id = sender_id)
                      OR (user_id = sender_id AND other_id = ${user.id})
                    )
            )
      ORDER BY id DESC
      LIMIT ${PAGE_SIZE}
    `);
  });
};

export default plugin;
