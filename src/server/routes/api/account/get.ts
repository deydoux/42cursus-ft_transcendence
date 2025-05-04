import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';
import generateAvatarURL from '#lib/generateAvatarURL';

const plugin: FastifyPluginAsync = async server => {
  server.get('/', async (request, reply) => {
    const {id} = request.user;
    const account = await server.db.get(
      SQL`SELECT id, username, has_avatar, avatar_version, password_edited_at AS passwordEditedAt FROM users WHERE id = ${id}`,
    );

    if (!account) return reply.notFound('Account not found');

    account.passwordEditedAt = new Date(account.passwordEditedAt * 1000);
    generateAvatarURL(account);

    return reply.send(account);
  });
};

export default plugin;
