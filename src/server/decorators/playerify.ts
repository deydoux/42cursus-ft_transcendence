import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';
import serializeUserAvatar from '#lib/serializeUserAvatar';

const plugin: FastifyPluginAsync = async server => {
  server.decorate('playerify', async client => {
    const user = await server.db.get(SQL`
      SELECT id, username, has_avatar, avatar_version
      FROM users
      WHERE id = ${client.userID}
    `);
    serializeUserAvatar(user);
    delete user.id;

    return {...user, score: 0, ...client};
  });
};

export default plugin;
