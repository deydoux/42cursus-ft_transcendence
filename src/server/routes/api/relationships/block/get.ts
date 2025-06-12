import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';

const plugin: FastifyPluginAsync = async server => {
  server.get('/', async (request, reply) => {
    const {user} = request;

    const relationships = await server.db.all(SQL`
      SELECT r.id AS relationshipID, r.created_at AS createdAt,
             u.id, username
      FROM relationships r
      JOIN users u
      ON type = 'block' AND user_id = ${user.id} AND other_id = u.id
      ORDER BY updated_at DESC
    `);

    relationships.forEach(relationship => {
      relationship.createdAt = new Date(relationship.createdAt * 1000);
    });

    return reply.send(relationships);
  });
};

export default plugin;
