import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';

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
    const {id: relationshipID} = request.params;
    const {id: userID} = request.user;

    const relationship = await server.db.get(
      SQL`SELECT type FROM relationships WHERE id = ${relationshipID} AND (user_id = ${userID} OR other_id = ${userID}) AND `,
    );
  });
};

export default plugin;
