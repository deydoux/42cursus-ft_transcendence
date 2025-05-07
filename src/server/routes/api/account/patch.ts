import {password, username} from '#lib/schemas';
import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import SQL from 'sql-template-strings';
import {compareSync} from 'bcrypt';
import {errorCodes} from 'fastify';
import hash from '#lib/hash';

const schema = {
  body: {
    type: 'object',
    properties: {
      username,
      password,
      confirmPassword: {type: 'string'},
      oldPassword: {type: 'string'},
    },
  } as const,
};

const plugin: FastifyPluginAsyncJsonSchemaToTs = async server => {
  server.patch('/', {schema}, async (request, reply) => {
    const {username, password, confirmPassword, oldPassword} = request.body;
    if (password !== confirmPassword)
      throw {
        ...errorCodes.FST_ERR_VALIDATION('Password mismatch'),
        field: 'confirmPassword',
      };

    const {id} = request.user;
    const columns = [];

    if (password) {
      const user = await server.db.get(
        SQL`SELECT password FROM users WHERE id = ${id}`,
      );

      if (!user || !oldPassword || !compareSync(oldPassword, user.password))
        throw {
          ...errorCodes.FST_ERR_VALIDATION('Invalid password'),
          statusCode: 401,
          field: 'oldPassword',
        };

      columns.push(SQL`password = ${hash(password)}`);
    }

    if (username) {
      columns.push(SQL`username = ${username}`);
      server.validateUsernameAvailability(username, id);
    }

    if (columns.length > 0) {
      const query = SQL`UPDATE users SET `;

      for (const [index, column] of columns.entries()) {
        if (index !== 0) query.append(SQL`, `);
        query.append(column);
      }

      query.append(SQL` WHERE id = ${id}`);

      await server.db.run(query);
    }

    return reply.code(204).send();
  });
};

export default plugin;
