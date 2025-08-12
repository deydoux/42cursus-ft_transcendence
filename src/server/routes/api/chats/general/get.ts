import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import SQL from 'sql-template-strings';
import serializeUserAvatar from '#lib/serializeUserAvatar';

const PAGE_SIZE = 50;

const schema = {
  querystring: {
    type: 'object',
    properties: {
      lastID: {type: 'integer', default: 0},
    },
  } as const,
};

const plugin: FastifyPluginAsyncJsonSchemaToTs = async server => {
  server.get('/', {schema}, async (request, reply) => {
    const {url, user} = request;
    const {lastID} = request.query;

    const messages = await server.db.all(SQL`
      SELECT id, user_id AS userID, content, created_at AS createdAt
      FROM direct_messages
      WHERE (${lastID} = 0 OR id < ${lastID}) AND NOT EXISTS (
              SELECT NULL
              FROM relationships
              WHERE type = 'block' AND (
                      (user_id = ${user.id} AND other_id = user_id)
                      OR (user_id = user_id AND other_id = ${user.id})
                    )
            )
      ORDER BY id DESC
      LIMIT ${PAGE_SIZE}
    `);

    messages.forEach(message => {
      message.createdAt = new Date(message.createdAt * 1000);
    });

    const users = messages
      .map(message => message.userID)
      .reduce((users, id) => {
        if (!users.includes(id)) users.push(id);
        return users;
      }, [])
      .sort((a: number, b: number) => a - b)
      .reduce((users: Record<number, Promise<unknown>>, id: number) => {
        users[id] = server.db
          .get(
            SQL`
              SELECT id, username, has_avatar, avatar_version
              FROM users
              WHERE id = ${id}
            `,
          )
          .then(user => serializeUserAvatar(user));

        return users;
      }, {});

    await Promise.all(Object.values(users));
  });
};

export default plugin;
