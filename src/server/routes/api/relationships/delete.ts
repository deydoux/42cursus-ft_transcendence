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
    const {id: userID} = request.user;
    const {id: relationshipID} = request.params;

    const relationship = await server.db.get(
      SQL`SELECT id, user_id AS userID, other_id AS otherID, type FROM relationships WHERE id = ${relationshipID} AND (user_id = ${userID} OR (other_id = ${userID} AND type != 'block'))`,
    );

    if (!relationship) return reply.notFound('Relationship not found');

    await server.db.run(
      SQL`DELETE FROM relationships WHERE id = ${relationshipID}`,
    );

    const message: TunnelMessage = {
      type: 'relationship',
      method: 'delete',
      id: relationshipID,
    };

    server.clients.sendUser(relationship.userID, message);
    if (relationship.type !== 'block')
      server.clients.sendUser(relationship.otherID, message);

    return reply.code(204).send();
  });
};

export default plugin;
