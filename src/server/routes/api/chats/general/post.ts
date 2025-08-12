import serializeUserAvatar from '#lib/serializeUserAvatar';
import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import SQL from 'sql-template-strings';

const schema = {
  body: {
    type: 'object',
    properties: {
      content: {type: 'string'},
    },
    required: ['content'],
  } as const,
};

const plugin: FastifyPluginAsyncJsonSchemaToTs = async server => {
  server.post('/', {schema}, async (request, reply) => {
    const {user} = request;

    const content = request.body.content.trim();
    if (content.length === 0)
      return reply.badRequest('Message content cannot be empty');
    if (content.length > 4096)
      return reply.badRequest('Message content cannot exceed 4096 characters');

    await server.db.run(SQL`
      INSERT INTO general_messages(user_id, content)
      VALUES(${user.id}, ${content})
    `);

    const sender = await server.db.get(SQL`
      SELECT id, username, has_avatar, avatar_version
      FROM users
      WHERE id = ${user.id}
    `);
    serializeUserAvatar(sender);

    const ignoreIDs = await server.db.all(SQL`
      SELECT u.id
      FROM relationships r
      JOIN users u
      ON r.type = 'block' AND (
           (r.user_id = ${user.id} AND r.other_id = u.id)
           OR (r.user_id = u.id AND r.other_id = ${user.id})
         )
    `);

    server.clients.broadcast(
      {type: 'generalMessage', sender, content},
      ignoreIDs,
    );
  });
};

export default plugin;
