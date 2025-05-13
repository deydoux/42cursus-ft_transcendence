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
    serializeUserAvatar(other);

    const relationship = server.db.get(
      SQL`SELECT type FROM relationships WHERE user_id = ${userID} AND other_id = ${other.id}`,
    );

    const otherRelationship = server.db.get(
      SQL`SELECT type FROM relationships WHERE user_id = ${other.id} AND other_id = ${userID}`,
    );

    if (await relationship)
      switch ((await relationship).type) {
        case 'block':
          return reply.conflict('You have blocked this user');
        case 'friend':
          return reply.badRequest('Already friends');
        case 'pending':
          return reply.badRequest('Already sent a friend request');
      }

    if (await otherRelationship)
      switch ((await otherRelationship).type) {
        case 'block':
          return reply.notFound('User not found');
        case 'friend':
          return reply.badRequest('Already friends');
        case 'pending':
          return reply.badRequest('Already received a friend request');
      }

    const {lastID: relationshipID} = await server.db.run(
      SQL`INSERT INTO relationships(user_id, other_id, type) VALUES (${userID}, ${other.id}, 'pending')`,
    );
    if (!relationshipID) throw new Error('Failed to create relationship');

    return reply.status(201).send({id: relationshipID, user: other});
  });
};

export default plugin;
