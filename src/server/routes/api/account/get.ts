import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';
import generateAvatarURL from '#lib/generateAvatarURL';

const plugin: FastifyPluginAsync = async server => {
  server.get('/', async (request, reply) => {
    const {id} = request.user;
    const {connection} = request;

    const [account, connections] = await Promise.all([
      server.db.get(
        SQL`SELECT id, username, password_edited_at AS passwordEditedAt, totp_enabled AS totp, has_avatar, avatar_version FROM users WHERE id = ${id}`,
      ),
      server.db.all(
        SQL`SELECT id, ip, user_agent AS userAgent, created_at AS createdAt, updated_at AS updatedAt FROM connections WHERE user_id = ${id} ORDER BY updated_at DESC`,
      ),
    ]);

    if (!account) return reply.notFound('Account not found');

    account.totp = Boolean(account.totp);
    account.passwordEditedAt = new Date(account.passwordEditedAt * 1000);
    generateAvatarURL(account);

    connections.forEach(connection => {
      connection.createdAt = new Date(connection.createdAt * 1000);
      connection.updatedAt = new Date(connection.updatedAt * 1000);
    });

    return reply.send({...account, connection, connections});
  });
};

export default plugin;
