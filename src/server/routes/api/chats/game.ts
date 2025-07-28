import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';

const schema = {
  body: {
    type: 'object',
    properties: {
      content: {type: 'string'},
    },
    required: ['content'],
  } as const,
};

const plugin: FastifyPluginAsyncJsonSchemaToTs = async server => {
  server.post('/game', {schema}, async (request, reply) => {
    const content = request.body.content.trim();
    if (content.length === 0)
      return reply.badRequest('Message content cannot be empty');
    if (content.length > 4096)
      return reply.badRequest('Message content cannot exceed 4096 characters');

    // const match =
    // const opponent =
    // TODO
  });
};

export default plugin;
