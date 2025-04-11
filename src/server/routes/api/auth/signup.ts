import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import fp from 'fastify-plugin';

const schema = {
  body: {
    type: 'object',
    properties: {
      username: {
        type: 'string',
        minLength: 3,
        maxLength: 16,
      },
      password: {
        type: 'string',
        minLength: 8,
        maxLength: 1024,
      },
    },
    required: ['username', 'password'],
  } as const,
};

const plugin: FastifyPluginAsyncJsonSchemaToTs = async server => {
  server.post('/api/auth/signup', {schema}, (request, reply) => {
    const {username, password} = request.body;
  });
};

export default fp(plugin);
