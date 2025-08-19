import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import SQL from 'sql-template-strings';
import serializeUserAvatar from '#lib/serializeUserAvatar';

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

    const usernames =
      content
        .match(/(?<=@)[a-zA-Z0-9_]+/g)
        ?.map(username => username.toLowerCase()) || [];

    let mentionedIDs: number[] = [];
    if (usernames.length > 0) {
      const query = SQL`
        SELECT id
        FROM users
        WHERE lower(username) IN (`;

      for (const [index, username] of usernames.entries()) {
        if (index !== 0) query.append(SQL`, `);
        query.append(SQL`${username}`);
      }

      query.append(SQL`)`);

      mentionedIDs = (await server.db.all(query)).map(row => row.id);
    }

    const sender = await server.db.get(SQL`
      SELECT id, username, has_avatar, avatar_version
      FROM users
      WHERE id = ${user.id}
    `);
    serializeUserAvatar(sender);

    const ignoreIDs = (
      await server.db.all(SQL`
        SELECT u.id
        FROM relationships r
        JOIN users u
        ON type = 'block' AND (
            (r.user_id = ${user.id} AND r.other_id = u.id)
            OR (r.user_id = u.id AND r.other_id = ${user.id})
          )
      `)
    ).map(row => row.id);

    ignoreIDs.push(user.id);
    mentionedIDs = mentionedIDs.filter(id => !ignoreIDs.includes(id));
    ignoreIDs.push(...mentionedIDs);

    const message = {
      type: 'generalMessage' as const,
      sender,
      content,
      mention: true,
    };

    for (const id of mentionedIDs) server.clients.sendUser(id, message);

    message.mention = false;
    server.clients.broadcast(message, ignoreIDs);
  });
};

export default plugin;
