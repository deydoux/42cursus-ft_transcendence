import {password, username} from '#lib/schemas';
import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';

const schema = {
  body: {
    type: 'object',
    properties: {username, password, oldPassword: {type: 'string'}},
  } as const,
};

const plugin: FastifyPluginAsyncJsonSchemaToTs = async server => {
  server.patch('/', {schema}, async (request, reply) => {
    void request;
    void reply;
  });
};

export default plugin;
