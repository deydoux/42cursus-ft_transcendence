import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';
import serializeUserAvatar from '#lib/serializeUserAvatar';

const plugin: FastifyPluginAsync = async server => {
  server.get('/', async (request, reply) => {
    const {user} = request;

    const friendRequests = (
      await server.db.get(SQL`
      SELECT count(*) as count
      FROM relationships
      WHERE type = 'pending' AND other_id = ${user.id}
    `)
    ).count;

    let general = await server.db.get(SQL`
      SELECT content, created_at AS createdAt,
             u.id, username, has_avatar, avatar_version
      FROM general_messages gm
      JOIN users u
      ON u.id = gm.user_id
      WHERE user_id = ${user.id} OR NOT EXISTS (
              SELECT NULL
              FROM relationships r
              WHERE type = 'block' AND (
                      (r.user_id = ${user.id} AND r.other_id = gm.user_id)
                      OR (r.user_id = gm.user_id AND r.other_id = ${user.id})
                    )
            )
      ORDER BY gm.id DESC
      LIMIT 1
    `);

    if (!general) general = null;
    else {
      serializeUserAvatar(general);

      general.user = {
        id: general.id,
        username: general.username,
        avatar: general.avatar,
      };

      ['id', 'username', 'avatar'].forEach(key => delete general[key]);

      general.createdAt = new Date(general.createdAt * 1000);
    }

    const directs = await server.db.all(SQL`
      SELECT r.id AS relationshipID,
             coalesce(dm.created_at, r.updated_at) AS updatedAt,
             u.id, username, last_seen, has_avatar, avatar_version,
             content, (
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
           ORDER BY id DESC
           LIMIT 1
         )
      ORDER BY updatedAt DESC
    `);

    directs.forEach(chat => {
      serializeUserAvatar(chat);

      chat.user = {
        id: chat.id,
        username: chat.username,
        avatar: chat.avatar,
        lastSeen: new Date(chat.last_seen * 1000),
      };

      ['id', 'username', 'avatar', 'last_seen'].forEach(
        key => delete chat[key],
      );

      chat.user.status = server.getUserStatus(chat.user.id);
      chat.invite = server.getUserInvite(user.id, chat.user.id);

      chat.updatedAt = new Date(chat.updatedAt * 1000);
    });

    return reply.send({friendRequests, general, directs});
  });
};

export default plugin;
