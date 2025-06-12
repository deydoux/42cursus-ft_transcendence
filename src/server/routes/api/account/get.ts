import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';
import serializeUserAvatar from '#lib/serializeUserAvatar';

const plugin: FastifyPluginAsync = async server => {
  server.get(
    '/',
    {
      schema: {
        summary: 'Get account information',
        tags: ['account'],
        response: {
          ...server.generateResponseSchema(200, [
            'id',
            'username',
            'passwordEditedAt',
            'totp',
            'avatar',
          ]),
          ...server.generateResponseSchema(404, [], 'Account not found'),
        },
      },
    },
    async (request, reply) => {
      const {id} = request.user;

      const user = await server.db.get(SQL`
      SELECT id, username, password_edited_at AS passwordEditedAt,
             totp_enabled AS totp, has_avatar, avatar_version
      FROM users
      WHERE id = ${id}
    `);

      if (!user) return reply.notFound('Account not found');

      user.totp = Boolean(user.totp);
      if (user.passwordEditedAt)
        user.passwordEditedAt = new Date(user.passwordEditedAt * 1000);
      serializeUserAvatar(user);

      return reply.send(user);
    },
  );
};

export default plugin;
