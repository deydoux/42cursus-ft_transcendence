import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';

const plugin: FastifyPluginAsync = async server => {
  server.get('/', async (request, reply) => {
    const {user} = request;

    const streaksRow = await server.db.all(SQL`
      SELECT game, mode, current, best
      FROM streaks
      WHERE user_id = ${user.id}
    `);

    async function formatStreaks(
      streaksRow: Record<string, unknown>[],
      game: string,
    ) {
      const rows = streaksRow.filter(streak => streak.game === game);
      const streaks: Record<string, unknown> = {};

      for (const row of rows) {
        const matchStats = await server.db.get(SQL`
          SELECT SUM(
                   CASE WHEN winner_id = ${user.id} AND result != 'tie'
                   THEN 1 ELSE 0 END
                 ) AS wins,
                 COUNT(*) AS total
          FROM matches
          WHERE game = ${game}
            AND mode = ${row.mode}
            AND (winner_id = ${user.id} OR loser_id = ${user.id})
        `);

        const wins = matchStats?.wins ?? 0;
        const totalMatches = matchStats?.total ?? 0;
        const winRate = totalMatches > 0 ? wins / totalMatches : 0;

        streaks[row.mode as string] = {
          current: row.current,
          best: row.best,
          winRate,
          totalMatches,
        };
      }

      return streaks;
    }

    const streaks = {
      pong: await formatStreaks(streaksRow, 'pong'),
      race: await formatStreaks(streaksRow, 'race'),
    };

    return reply.send(streaks);
  });
};

export default plugin;
