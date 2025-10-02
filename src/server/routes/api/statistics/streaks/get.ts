import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';

function formatStreaks(streaksRow: Record<string, unknown>[], game: string) {
  return streaksRow
    .filter(streak => streak.game === game)
    .reduce((streaks, streak) => {
      streaks[streak.mode as string] = {
        current: streak.current,
        best: streak.best,
      };

      return streaks;
    }, {});
}

const plugin: FastifyPluginAsync = async server => {
  server.get('/', async (request, reply) => {
    const {user} = request;

    const streaksRow = await server.db.all(SQL`
      SELECT game, mode, current, best
      FROM streaks
      WHERE user_id = ${user.id}
    `);

    const streaks = {
      pong: formatStreaks(streaksRow, 'pong'),
      race: formatStreaks(streaksRow, 'race'),
    };

    return reply.send(streaks);
  });
};

export default plugin;
