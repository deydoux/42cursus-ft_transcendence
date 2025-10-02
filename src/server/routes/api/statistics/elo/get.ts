import * as ms from 'ms';
import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import SQL from 'sql-template-strings';

const schema = {
  querystring: {
    type: 'object',
    properties: {
      game: {enum: ['pong', 'race']},
      since: {type: 'string'},
    },
  } as const,
};

const plugin: FastifyPluginAsyncJsonSchemaToTs = async server => {
  server.get('/', {schema}, async (request, reply) => {
    const {query, user} = request;

    const dbQuery = SQL`
      SELECT game, value, created_at AS createdAt
      FROM elo
      WHERE user_id = ${user.id}`;

    if (query.game) dbQuery.append(SQL` AND game = ${query.game}`);

    if (query.since) {
      const relative = ms(query.since as ms.StringValue);
      if (relative) {
        const since = Math.floor((Date.now() - relative) / 1000);
        dbQuery.append(SQL` AND created_at >= ${since}`);
      }
    }

    dbQuery.append(SQL`
      ORDER BY id DESC
    `);

    const elos = await server.db.all(dbQuery);

    elos.forEach(elo => {
      elo.createdAt = new Date(elo.createdAt * 1000);
    });

    return reply.send(elos);
  });
};

export default plugin;
