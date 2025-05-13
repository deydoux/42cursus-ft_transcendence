import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';
import generateAvatarURL from '#lib/generateAvatarURL';

const plugin: FastifyPluginAsync = async server => {
  server.get('/', async (request, reply) => {
    const {id} = request.user;

    const friends = await server.db.all(
      SQL`SELECT r.id AS relationshipID, u.id, u.username, u.last_seen AS lastSeen, u.has_avatar, u.avatar_version
          FROM relationships r
          JOIN users u ON (r.user_id = ${id} AND u.id = r.other_id) OR
                          (r.other_id = ${id} AND u.id = r.user_id)
          WHERE r.type = 'friend' AND (r.user_id = ${id} OR r.other_id = ${id})`,
    );

    friends.forEach(friend => {
      generateAvatarURL(friend);
      friend.lastSeen = new Date(friend.lastSeen * 1000);
      friend.online = server.clients.isUserOnline(friend.id);
      // return {...friend, online: server.clients.isUserOnline(friend.id)};
    });

    return reply.send({friends});
  });
};

export default plugin;
