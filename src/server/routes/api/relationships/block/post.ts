import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import SQL from 'sql-template-strings';

const schema = {
  body: {
    type: 'object',
    properties: {
      username: {type: 'string'},
    },
    required: ['username'],
  } as const,
};

const plugin: FastifyPluginAsyncJsonSchemaToTs = async server => {
  server.post('/', {schema}, async (request, reply) => {
    const {username} = request.body;

    const other = await server.db.get(SQL`
      SELECT id, username
      FROM users
      WHERE lower(username) = lower(${username})
    `);

    return server.blockUser(request, reply, other);
  });
};

export default plugin;
