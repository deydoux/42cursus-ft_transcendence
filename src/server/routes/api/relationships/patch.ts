import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import SQL from 'sql-template-strings';
import {idParamsSchema as schema} from '#lib/schemas';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async server => {
  server.patch('/:id', {schema}, async (request, reply) => {
    const {user} = request;
    const {id} = request.params;

    const relationship = await server.db.get(SQL`
      SELECT other_id AS otherID, type
      FROM relationships
      WHERE id = ${id} AND (user_id = ${user.id} OR other_id = ${user.id})`);

    if (!relationship) return reply.notFound('Relationship not found');

    if (relationship.otherID !== user.id)
      return reply.badRequest('Cannot change your own relationship');

    if (relationship.type !== 'pending') {
      if (relationship.type === 'block')
        return reply.notFound('Relationship not found');

      return reply.badRequest(
        `Cannot change ${relationship.type} relationship`,
      );
    }

    await server.db.run(SQL`
      UPDATE relationships
      SET type = 'friend'
      WHERE id = ${id} AND type = 'pending' AND other_id = ${user.id}`);

    return reply.code(204).send();
  });
};

export default plugin;
