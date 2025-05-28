import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';

const plugin: FastifyPluginAsync = async server => {
  server.get('/', async (request, reply) => {
    const {id} = request.user;

    const chats = await server.db.all(SQL`
      SELECT r.updated_at AS updatedAt,
             u.id, username, last_seen AS lastSeen, has_avatar, avatar_version,
             message, dm.created_at AS updatedAt,
             (
               SELECT COUNT(*)
               FROM direct_messages
               WHERE sender_id = u.id AND recipient_id = ${id} AND read = 0
             ) AS unread
      FROM relationships r
      JOIN users u
      ON (user_id = ${id} AND u.id = other_id)
         OR (other_id = ${id} AND u.id = user_id)
      JOIN direct_messages dm
      ON dm.id = (
                    SELECT id
                    FROM direct_messages
                    WHERE (sender_id = ${id} AND recipient_id = u.id)
                          OR (sender_id = u.id AND recipient_id = ${id})
                    ORDER BY created_at DESC
                    LIMIT 1
                 )
      WHERE type = 'friend' AND (user_id = ${id} OR other_id = ${id})`);

    return reply.send(chats);
  });
};

export default plugin;
