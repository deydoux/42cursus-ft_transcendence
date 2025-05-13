import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';
import serializeUserAvatar from '#lib/serializeUserAvatar';

const plugin: FastifyPluginAsync = async server => {
  server.get('/', async (request, reply) => {
    const {id} = request.user;

    const friends = await server.db.all(
      SQL`SELECT r.id AS relationshipID,
                 u.id, username, last_seen AS lastSeen,
                 has_avatar, avatar_version
          FROM relationships r
          JOIN users u ON (user_id = ${id} AND u.id = other_id)
                          OR (other_id = ${id} AND u.id = user_id)
          WHERE type = 'friend' AND (user_id = ${id} OR other_id = ${id})
          ORDER BY u.username`,
    );

    friends.forEach(friend => {
      serializeUserAvatar(friend);
      friend.lastSeen = new Date(friend.lastSeen * 1000);
      friend.online = server.clients.isUserOnline(friend.id);
    });

    return reply.send(friends);
  });
};

export default plugin;
