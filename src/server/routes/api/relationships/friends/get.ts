import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';
import serializeUserAvatar from '#lib/serializeUserAvatar';

const plugin: FastifyPluginAsync = async server => {
  server.get('/', async (request, reply) => {
    const {user} = request;

    const friends = await server.db.all(SQL`
      SELECT r.id AS relationshipID,
             u.id, username, last_seen AS lastSeen, has_avatar, avatar_version
      FROM relationships r
      JOIN users u
      ON type = 'friend' AND (
           (user_id = ${user.id} AND other_id = u.id)
           OR (user_id = u.id AND other_id = ${user.id})
         )
      ORDER BY u.username
    `);

    friends.forEach(friend => {
      serializeUserAvatar(friend);
      friend.lastSeen = new Date(friend.lastSeen * 1000);
      friend.status = server.getUserStatus(friend.id);
    });

    return reply.send(friends);
  });
};

export default plugin;
