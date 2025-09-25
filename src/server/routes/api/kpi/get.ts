import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';

const plugin: FastifyPluginAsync = async server => {
  server.get('/', async (request, reply) => {
    const {totalUsers} = await server.db.get(SQL`
      SELECT COUNT(*) AS totalUsers
      FROM users
    `);

    const {totalGames} = await server.db.get(SQL`
      SELECT COUNT(*) AS totalGames
      FROM matches
    `);

    const user = await server.db.get(SQL`
      SELECT username
      FROM users
      JOIN elo
      ON users.id = elo.user_id
      WHERE game = 'pong'
      ORDER BY value DESC
      LIMIT 1
    `);

    const bestPlayer = user?.username || 'hkitty';

    return reply.send({totalUsers, totalGames, bestPlayer});
  });
};

export default plugin;
