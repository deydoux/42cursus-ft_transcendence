import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import SQL from 'sql-template-strings';
import {idParamsSchema as schema} from '#lib/schemas';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async server => {
  server.post('/', {schema}, async (request, reply) => {
    const {id} = request.params;

    const other = await server.db.get(SQL`
      SELECT id, username
      FROM users
      WHERE id = ${id}
    `);

    return server.blockUser(request, reply, other);
  });
};

export default plugin;
