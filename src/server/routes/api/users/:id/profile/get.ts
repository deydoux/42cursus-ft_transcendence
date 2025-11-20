import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import SQL from 'sql-template-strings';
import {idParamsSchema as schema} from '#lib/schemas';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async server => {
  server.get('/', {schema}, async (request, reply) => {
    const {id} = request.params;

    const elo: Record<string, unknown> = {};

    for (const game of ['pong', 'race']) {
      const row = await server.db.get(SQL`
        SELECT value
        FROM elo
        WHERE user_id = ${id} AND game = ${game}
        ORDER BY id DESC
        LIMIT 1
      `);

      if (!row) return reply.notFound('User not found');

      elo[game] = row.value;
    }

    const totalMatches = await server.db.get(SQL`
      SELECT COUNT(*) as count
      FROM matches
      WHERE winner_id = ${id} OR loser_id = ${id}
    `);

    return reply.send({elo, totalMatches: totalMatches.count});
  });
};

export default plugin;
