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
      const streaks = {
        wins: 0,
        losses: 0,
        totalMatches: 0,
        winRate: 0,
      };

      for (const row of rows) {
        const matchStats = await server.db.get(SQL`
          SELECT SUM(
                   CASE WHEN winner_id = ${user.id}
                             AND (result != 'tie' OR result IS NULL)
                   THEN 1 ELSE 0 END
                 ) AS wins,
                 COUNT(*) AS total
          FROM matches
          WHERE game = ${game} AND mode = ${row.mode}
                AND (winner_id = ${user.id} OR loser_id = ${user.id})
        `);

        streaks.wins += matchStats?.wins ?? 0;
        streaks.totalMatches += matchStats?.total ?? 0;

        (streaks as Record<string, unknown>)[row.mode as string] = {
          current: row.current,
          best: row.best,
        };
      }

      streaks.losses = streaks.totalMatches - streaks.wins;
      streaks.winRate =
        streaks.totalMatches > 0 ? streaks.wins / streaks.totalMatches : 0;

      return streaks;
    }

    const streaks = {
      total: {
        wins: 0,
        losses: 0,
        totalMatches: 0,
        winRate: 0,
      },
      pong: await formatStreaks(streaksRow, 'pong'),
      race: await formatStreaks(streaksRow, 'race'),
    };

    for (const game of ['pong', 'race'] as const) {
      streaks.total.wins += streaks[game].wins;
      streaks.total.losses += streaks[game].losses;
      streaks.total.totalMatches += streaks[game].totalMatches;
    }

    streaks.total.winRate =
      streaks.total.totalMatches > 0
        ? streaks.total.wins / streaks.total.totalMatches
        : 0;

    return reply.send(streaks);
  });
};

export default plugin;
