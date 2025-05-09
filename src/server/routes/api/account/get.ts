import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';
import generateAvatarURL from '#lib/generateAvatarURL';

const plugin: FastifyPluginAsync = async server => {
  server.get('/', async (request, reply) => {
    const {id} = request.user;
    const {connection} = request;

    const [user, connections] = await Promise.all([
      server.db.get(
        SQL`SELECT id, username, password_edited_at AS passwordEditedAt, totp_enabled AS totp, has_avatar, avatar_version FROM users WHERE id = ${id}`,
      ),
      server.db.all(
        SQL`SELECT id, ip, user_agent AS userAgent, created_at AS createdAt, updated_at AS updatedAt FROM connections WHERE user_id = ${id} ORDER BY updated_at DESC`,
      ),
    ]);

    if (!user) return reply.notFound('Account not found');

    user.totp = Boolean(user.totp);
    if (user.passwordEditedAt)
      user.passwordEditedAt = new Date(user.passwordEditedAt * 1000);
    generateAvatarURL(user);

    connections.forEach(connection => {
      connection.createdAt = new Date(connection.createdAt * 1000);
      connection.updatedAt = new Date(connection.updatedAt * 1000);
    });

    return reply.send({...user, connection, connections});
  });
};

export default plugin;
