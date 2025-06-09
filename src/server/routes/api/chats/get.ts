import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';
import serializeUserAvatar from '#lib/serializeUserAvatar';

const plugin: FastifyPluginAsync = async server => {
  server.get('/', async (request, reply) => {
    const {user} = request;

    const chats = await server.db.all(SQL`
      SELECT r.id AS relationshipID,
             coalesce(dm.created_at, r.updated_at) AS updatedAt,
             u.id, username, last_seen AS lastSeen, has_avatar, avatar_version,
             content,
             (
                SELECT count(*)
                FROM direct_messages
                WHERE sender_id = u.id AND recipient_id = ${user.id}
                      AND read = FALSE
             ) AS unread
      FROM relationships r
      JOIN users u
      ON type = 'friend' AND (
            (user_id = ${user.id} AND other_id = u.id)
            OR (user_id = u.id AND other_id = ${user.id})
         )
      LEFT JOIN direct_messages dm
      ON dm.id = (
                    SELECT id
                    FROM direct_messages
                    WHERE (sender_id = ${user.id} AND recipient_id = u.id)
                          OR (sender_id = u.id AND recipient_id = ${user.id})
                    ORDER BY created_at DESC
                    LIMIT 1
         )
      ORDER BY updatedAt DESC
    `);

    chats.forEach(chat => {
      serializeUserAvatar(chat);
      chat.updatedAt = new Date(chat.updatedAt * 1000);
      chat.lastSeen = new Date(chat.lastSeen * 1000);
      chat.online = server.clients.isUserOnline(chat.id);
    });

    return reply.send(chats);
  });
};

export default plugin;
