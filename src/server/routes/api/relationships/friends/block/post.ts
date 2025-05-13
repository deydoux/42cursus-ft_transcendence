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

    const relationship = await server.db.get(SQL`
      SELECT NULL
      FROM relationships
      WHERE user_id = ${userID} AND other_id = ${other.id} AND type = 'block'`);

    if (relationship)
      return reply.badRequest('You have already blocked this user');

    await server.db.run(SQL`
      DELETE FROM relationships
      WHERE user_id = ${userID} AND other_id = ${other.id}`);

    await server.db.run(SQL`
      DELETE FROM relationships
      WHERE user_id = ${other.id} AND other_id = ${userID}
            AND type != 'block'`);

    const {lastID: relationshipID} = await server.db.run(SQL`
      INSERT INTO relationships(user_id, other_id, type)
      VALUES (${userID}, ${other.id}, 'block')`);

    return reply.code(201).send({id: relationshipID, user: other});
  });
};

export default plugin;
