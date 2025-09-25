import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';
import serializeUserAvatar from '#lib/serializeUserAvatar';

const plugin: FastifyPluginAsync = async server => {
  server.get('/', async (request, reply) => {
    const {id} = request.user;

    const user = await server.db.get(SQL`
      SELECT u.id, username, password, password_edited_at AS passwordEditedAt,
             totp_enabled AS totp, has_avatar, avatar_version, value AS elo
      FROM users u
      JOIN elo e
      ON u.id = e.user_id
      WHERE u.id = ${id} AND game = 'pong'
      ORDER BY e.id DESC
      LIMIT 1
    `);

    if (!user) return reply.notFound('Account not found');

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
