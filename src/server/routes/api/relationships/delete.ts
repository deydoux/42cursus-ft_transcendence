import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import SQL from 'sql-template-strings';
import {idParamsSchema as schema} from '#lib/schemas';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async server => {
  server.delete('/:id', {schema}, async (request, reply) => {
    const {user} = request;
    const {id: relationshipID} = request.params;

    const relationship = await server.db.get(SQL`
      SELECT id, user_id AS userID, other_id AS otherID, type
      FROM relationships
      WHERE id = ${relationshipID}
            AND (user_id = ${user.id}
                OR (other_id = ${user.id} AND type != 'block'))`);

    if (!relationship) return reply.notFound('Relationship not found');

    await server.db.run(SQL`
      DELETE FROM relationships WHERE id = ${relationshipID}`);

    return reply.code(204).send();
  });
};

export default plugin;
