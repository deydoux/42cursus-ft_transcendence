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
    const {id: userID} = request.user;
    const {username} = request.body;

    const other = await server.db.get(SQL`
      SELECT id, username
      FROM users
      WHERE lower(username) = lower(${username})`);

    if (!other) return reply.notFound('User not found');
    if (userID === other.id)
      return reply.badRequest('You cannot block yourself');

    const relationship = await server.db.get(
      SQL`SELECT type
          FROM relationships
          WHERE user_id = ${userID} AND other_id = ${other.id}`,
    );

    if (relationship)
      switch (relationship.type) {
        case 'block':
          return reply.conflict('You have already blocked this user');
        case 'pending':
          return reply.badRequest(
            'You have sent a friend request to this user',
          );
      }

    const otherRelationship = await server.db.get(
      SQL`SELECT type
          FROM relationships
          WHERE user_id = ${other.id} AND other_id = ${userID}`,
    );

    if (relationship?.type === 'friend' || otherRelationship?.type === 'friend')
      return reply.badRequest('You are friend with this user');

    if (otherRelationship?.type === 'pending')
      await server.db.run(SQL`
        DELETE FROM relationships
        WHERE user_id = ${other.id} AND other_id = ${userID}`);
  });
};

export default plugin;
