import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import SQL from 'sql-template-strings';
import serializeUserAvatar from '#lib/serializeUserAvatar';

const schema = {
  querystring: {
    type: 'object',
    properties: {
      game: {enum: ['pong', 'race']},
    },
  } as const,
};

const plugin: FastifyPluginAsyncJsonSchemaToTs = async server => {
  server.get('/', {schema}, async (request, reply) => {
    const {query} = request;

    const user = await server.db.get(SQL`
      SELECT id, username, has_avatar, avatar_version
      FROM users
      WHERE id = ${request.user.id}
    `);
    serializeUserAvatar(user);

    const dbQuery = SQL`
      SELECT game, mode, winner_id, loser_id, winner_score, loser_score, draw,
             created_at AS createdAt, updated_at AS updatedAt,
             u.id, username, has_avatar, avatar_version,
             winner_elo, loser_elo, elo_change AS eloChange
      FROM matches m
      LEFT JOIN users u
      ON (winner_id = ${user.id} AND loser_id = u.id)
         OR (winner_id = u.id AND loser_id = ${user.id})
      LEFT JOIN ranked_matches rm
      ON mode = 'ranked' AND m.id = rm.id
      WHERE (winner_id = ${user.id} OR loser_id = ${user.id})`;

    if (query.game) dbQuery.append(SQL` AND game = ${query.game}`);
    dbQuery.append(SQL`
      ORDER BY id DESC
    `);

    const matches = await server.db.all(dbQuery);
    matches.forEach(match => {
      serializeUserAvatar(match);

      const isUserWinner = match.winner_id === user.id;
      user.score = isUserWinner ? match.winner_score : match.loser_score;
      const other: Record<string, unknown> = {
        id: isUserWinner ? match.loser_id : match.winner_id,
        username: match.username || 'Deleted user',
        avatar: match.avatar,
        score: isUserWinner ? match.loser_score : match.winner_score,
      };

      if (match.mode === 'ranked') {
        user.elo = isUserWinner ? match.winner_elo : match.loser_elo;
        other.elo = isUserWinner ? match.loser_elo : match.winner_elo;
      } else delete match.eloChange;

      match.winner = isUserWinner ? user : other;
      match.loser = isUserWinner ? other : user;

      match.createdAt = new Date(match.createdAt * 1000);
      match.updatedAt = new Date(match.updatedAt * 1000);

      [
        'winner_id',
        'loser_id',
        'winner_score',
        'loser_score',
        'id',
        'username',
        'avatar',
        'winner_elo',
        'loser_elo',
      ].forEach(key => delete match[key]);
    });

    return reply.send(matches);
  });
};

export default plugin;
