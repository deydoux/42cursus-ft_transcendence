import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';

const plugin: FastifyPluginAsync = async server => {
  server.get('/', async (request, reply) => {
    const {id} = request.user;

    const user = await server.db.get(SQL`
      SELECT id, username, last_seen, password_edited_at, totp_enabled,
             has_avatar, avatar_version
      FROM users
      WHERE id = ${id}
    `);

    const sessions = await server.db.all(SQL`
      SELECT id, user_agent, created_at, updated_at, expires_at
      FROM sessions
      WHERE user_id = ${id}
    `);

    const relationships = await server.db.all(SQL`
      SELECT id, type, user_id, other_id, created_at, updated_at
      FROM relationships
      WHERE user_id = ${id} OR (other_id = ${id} AND type != 'block')
    `);

    const direct_messages = await server.db.all(SQL`
      SELECT sender_id, recipient_id, content, created_at,
             CASE WHEN sender_id = ${id} THEN FALSE ELSE read END AS read
      FROM direct_messages
      WHERE sender_id = ${id} OR recipient_id = ${id}
    `);

    const general_messages = await server.db.all(SQL`
      SELECT id, content, created_at
      FROM general_messages
      WHERE user_id = ${id}
    `);

    const matches = await server.db.all(SQL`
      SELECT m.id, game, mode, winner_id, loser_id, winner_score, loser_score,
             result, created_at, updated_at, winner_elo, loser_elo, elo_change
      FROM matches m
      LEFT JOIN ranked_matches rm
      ON mode = 'ranked' AND m.id = rm.id
      WHERE winner_id = ${id} OR loser_id = ${id}
    `);

    const elo = await server.db.all(SQL`
      SELECT id, game, value, created_at
      FROM elo
      WHERE user_id = ${id}
    `);

    return reply
      .header(
        'content-disposition',
        `attachment; filename="account_${id}.json"`,
      )
      .send({
        user,
        sessions,
        relationships,
        direct_messages,
        general_messages,
        matches,
        elo,
      });
  });
};

export default plugin;
