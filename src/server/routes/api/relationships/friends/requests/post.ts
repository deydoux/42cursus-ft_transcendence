import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import SQL from 'sql-template-strings';
import serializeUserAvatar from '#lib/serializeUserAvatar';

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
    const {username: otherUsername} = request.body;

    const other = await server.db.get(
      SQL`SELECT id, username, has_avatar, avatar_version
          FROM users
          WHERE lower(username) = lower(${otherUsername})`,
    );

    if (!other) return reply.notFound('User not found');
    if (userID === other.id)
      return reply.badRequest('You cannot send a friend request to yourself');

    serializeUserAvatar(other);

    const relationship = await server.db.get(SQL`
      SELECT type
      FROM relationships
      WHERE user_id = ${userID} AND other_id = ${other.id}`);

    if (relationship)
      switch (relationship.type) {
        case 'block':
          return reply.conflict('You have blocked this user');
        case 'friend':
          return reply.badRequest('Already friends with this user');
        case 'pending':
          return reply.badRequest('Friend request already sent');
      }

    const otherRelationship = await server.db.get(SQL`
      SELECT id, type
      FROM relationships
      WHERE user_id = ${other.id} AND other_id = ${userID}`);

    if (otherRelationship)
      switch (otherRelationship.type) {
        case 'block':
          return reply.notFound('User not found');
        case 'friend':
          return reply.badRequest('Already friends with this user');
        case 'pending':
          return reply.badRequest('Already received a friend request');
      }

    const {lastID: relationshipID} = await server.db.run(
      SQL`INSERT INTO relationships(user_id, other_id, type) VALUES (${userID}, ${other.id}, 'pending')`,
    );

    return reply.status(201).send({id: relationshipID, user: other});
  });
};

export default plugin;
