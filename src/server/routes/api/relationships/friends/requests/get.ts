import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';
import serializeUserAvatar from '#lib/serializeUserAvatar';

const plugin: FastifyPluginAsync = async server => {
  const getPendingRelationships = async (userID: number, other: boolean) => {
    const query = SQL`
      SELECT r.id AS relationshipID, r.created_at AS createdAt,
            u.id, username, has_avatar, avatar_version
      FROM relationships r
      JOIN users u
    `;

    if (other)
      query.append(SQL`
        ON type = 'pending' AND user_id = u.id AND other_id = ${userID}
      `);
    else
      query.append(SQL`
      ON type = 'pending' AND user_id = ${userID} AND other_id = u.id
    `);

    query.append(SQL`
      ORDER BY created_at DESC
    `);

    const relationships = await server.db.all(query);
    relationships.forEach(relationship => {
      relationship.createdAt = new Date(relationship.createdAt * 1000);
      serializeUserAvatar(relationship);
    });

    return relationships;
  };

  server.get('/received', async (request, reply) =>
    reply.send(getPendingRelationships(request.user.id, true)),
  );

  server.get('/sent', async (request, reply) =>
    reply.send(getPendingRelationships(request.user.id, false)),
  );
};

export default plugin;
