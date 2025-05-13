import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import {idParamsSchema as schema} from '#lib/schemas';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async server => {
  server.patch('/:id', {schema}, async (request, reply) => {});
};

export default plugin;
