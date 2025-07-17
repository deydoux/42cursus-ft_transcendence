import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import SQL from 'sql-template-strings';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async server => {
  server.post('/matches', async (request, reply) => {
    const matches = await server.db.all(SQL`
      SELECT * FROM matches
      WHERE user_id = ${request.user.id}
    `);
  });
};

export default plugin;
