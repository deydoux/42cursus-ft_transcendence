import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import SQL from 'sql-template-strings';

const schema = {
  params: {
    type: 'object',
    properties: {
      id: {type: 'number'},
    },
    required: ['id'],
  } as const,
};

const plugin: FastifyPluginAsyncJsonSchemaToTs = async server => {
  server.delete('/:id', {schema}, async (request, reply) => {
    const {id} = request.user;
    const {id: relationshipID} = request.params;

    const relationship = await server.db.get(
      SQL`SELECT type FROM relationships WHERE id = ${relationshipID} AND (user_id = ${id} OR other_id = ${id}) AND type = 'friend'`,
    );

    if (!relationship) return reply.notFound('Relationship not found');

    await server.db.run(
      SQL`DELETE FROM relationships WHERE (user_id = ${id} OR other_id = ${id}) AND type = 'friend'`,
    );

    return reply.code(204).send();
  });
};

export default plugin;
