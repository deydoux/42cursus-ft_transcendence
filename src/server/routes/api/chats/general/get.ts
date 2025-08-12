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
      FROM general_messages gm
      WHERE (${lastID} = 0 OR id < ${lastID})
            AND (user_id = ${user.id} OR NOT EXISTS (
              SELECT NULL
              FROM relationships r
              WHERE type = 'block' AND (
                      (r.user_id = ${user.id} AND r.other_id = gm.user_id)
                      OR (r.user_id = gm.user_id AND r.other_id = ${user.id})
                    )
            ))
      ORDER BY id DESC
      LIMIT ${PAGE_SIZE}
    `);

    messages.forEach(message => {
      message.createdAt = new Date(message.createdAt * 1000);
    });

    const userIDs = messages
      .map(message => message.userID)
      .reduce((users, id) => {
        if (!users.includes(id)) users.push(id);
        return users;
      }, [])
      .sort((a: number, b: number) => a - b);

    let users = {};
    if (userIDs.length > 0) {
      const query = SQL`
        SELECT id, username, has_avatar, avatar_version
        FROM users
        WHERE id IN (`;

      for (const [index, id] of userIDs.entries()) {
        if (index !== 0) query.append(SQL`, `);
        query.append(SQL`${id}`);
      }

      query.append(SQL`)`);

      users = (await server.db.all(query)).reduce((users, user) => {
        serializeUserAvatar(user);
        users[user.id] = user;
        return users;
      }, {});
    }
    console.log(users);

    // const users: Record<number, unknown> = {};
    // for (const id of userIDs) {
    //   const user = await server.db.get(SQL`
    //     SELECT id, username, has_avatar, avatar_version
    //     FROM users
    //     WHERE id = ${id}
    //   `);
    //   serializeUserAvatar(user);

    //   users[id] = user;
    // }

    const next =
      messages.length !== PAGE_SIZE
        ? null
        : `${url.split('?')[0]}?lastID=${messages[PAGE_SIZE - 1].id}`;

    return reply.send({users, messages, next});
  });
};

export default plugin;
