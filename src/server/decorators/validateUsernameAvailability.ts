import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';
import {errorCodes} from 'fastify';

const plugin: FastifyPluginAsync = async server => {
  server.decorate('validateUsernameAvailability', async (username, id) => {
    const user = await server.db.get(
      SQL`SELECT NULL FROM users WHERE id != ${id ?? 0} AND lower(username) = lower(${username})`,
    );

    if (!user) return;

    throw {
      ...errorCodes.FST_ERR_VALIDATION('Username already taken'),
      statusCode: 409,
      field: 'username',
    };
  });
};

export default plugin;
