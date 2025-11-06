import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import SQL from 'sql-template-strings';
import compareHash from '#lib/compareHash';

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
  server.post('/login', {schema}, async (request, reply) => {
    const {username, password} = request.body;
    const user = await server.db.get(SQL`
      SELECT id, password, totp_enabled AS totp
      FROM users
      WHERE lower(username) = lower(${username})
    `);

    if (!user?.password || !compareHash(password, user.password))
      return reply.unauthorized('Invalid username or password');

    if (user.totp) {
      const accessToken = await request.generateAccessToken(user.id, 'totp');
      return reply.send({accessToken, totp: true});
    }

    const {accessToken, refreshToken} = await request.generateTokens(user.id);
    return reply
      .setCookie('refreshToken', refreshToken)
      .send({accessToken, totp: false});
  });
};

export default plugin;
