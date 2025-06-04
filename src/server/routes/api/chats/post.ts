import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
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
    const recipient = await server.db.get(SQL`
      SELECT id
      FROM users
      WHERE id = ${request.body.recipientID}
    `);

    if (!recipient) return reply.notFound('Recipient not found');
    if (recipient.id === request.user.id)
      return reply.badRequest('Cannot send message to yourself');

    // const relationship = await server.db.get(SQL`
    //   SELECT type
    //   FROM relationships
  });
};

export default plugin;
