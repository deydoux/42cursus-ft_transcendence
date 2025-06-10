import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
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
    const page = (request.query as QueryParams).page;
    return reply.send({page});
  });
};

export default plugin;
