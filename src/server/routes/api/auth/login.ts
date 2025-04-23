import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import SQL from 'sql-template-strings';
import {compareSync} from 'bcrypt';
import fp from 'fastify-plugin';

const schema = {
  body: {
    type: 'object',
    properties: {
      username: {type: 'string'},
      password: {type: 'string'},
    },
    required: ['username', 'password'],
  } as const,
};

const plugin: FastifyPluginAsyncJsonSchemaToTs = async server => {
  server.post('/api/auth/login', {schema}, async (request, reply) => {
    const {username, password} = request.body;
    const user = await server.db.get(SQL`
      SELECT id, password FROM users WHERE username = ${username}
    `);

    if (!user || !compareSync(password, user.password))
      throw server.httpErrors.unauthorized('Invalid username or password');

    const {accessToken, refreshToken} = await request.generateTokens(user.id);
    return reply.setCookie('refreshToken', refreshToken).send({accessToken});
  });
};

export default fp(plugin);
