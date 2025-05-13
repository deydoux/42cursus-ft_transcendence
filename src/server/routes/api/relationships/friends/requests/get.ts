import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';
import serializeUserAvatar from '#lib/serializeUserAvatar';

const plugin: FastifyPluginAsync = async server => {
  server.get('/received', async (request, reply) => {
    const {id} = request.user;

    const relationships = await server.db.all(
      SQL`SELECT r.id AS relationshipID, r.created_at AS createdAt,
                 u.id, u.username, u.has_avatar, u.avatar_version
          FROM relationships r
          JOIN users u ON u.id = r.user_id
          WHERE other_id = ${id} AND type = 'pending'
          ORDER BY r.created_at DESC`,
    );

    relationships.forEach(relationship => {
      relationship.createdAt = new Date(relationship.createdAt * 1000);
      serializeUserAvatar(relationship);
    });

    return reply.send(relationships);
  });

  server.get('/sent', async (request, reply) => {
    const {id} = request.user;

    const relationships = await server.db.all(
      SQL`SELECT r.id AS relationshipID, r.created_at AS createdAt,
                 u.id, u.username, u.has_avatar, u.avatar_version
          FROM relationships r
          JOIN users u ON u.id = r.other_id
          WHERE user_id = ${id} AND type = 'pending'
          ORDER BY r.created_at DESC`,
    );

    relationships.forEach(relationship => {
      relationship.createdAt = new Date(relationship.createdAt * 1000);
      serializeUserAvatar(relationship);
    });

    return reply.send(relationships);
  });
};

export default plugin;
