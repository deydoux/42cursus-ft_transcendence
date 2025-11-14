import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';
import serializeUserAvatar from '#lib/serializeUserAvatar';

const plugin: FastifyPluginAsync = async server => {
  server.get('/', async (request, reply) => {
    const {id} = request.user;

    const user = await server.db.get(SQL`
      SELECT id, username, password, password_edited_at AS passwordEditedAt,
             totp_enabled AS totp, has_avatar, avatar_version
      FROM users
      WHERE id = ${id}
    `);

    if (!user) return reply.notFound('Account not found');

    user.elo = {};

    for (const game of ['pong', 'race']) {
      const row = await server.db.get(SQL`
        SELECT value
        FROM elo
        WHERE user_id = ${id} AND game = ${game}
        ORDER BY id DESC
        LIMIT 1
      `);

      if (!row) return reply.notFound('Account not found');

      user.elo[game] = row.value;
    }

    user.hasAvatar = Boolean(user.has_avatar);
    user.totp = Boolean(user.totp);
    if (!user.password) user.passwordEditedAt = null;
    else user.passwordEditedAt = new Date(user.passwordEditedAt * 1000);
    delete user.password;
    serializeUserAvatar(user);

    return reply.send(user);
  });
};

export default plugin;
