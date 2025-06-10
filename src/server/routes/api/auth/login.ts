import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import {FastifyRequest} from 'fastify';
import SQL from 'sql-template-strings';
import {compareSync} from 'bcrypt';

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

let it = 0;

const plugin: FastifyPluginAsyncJsonSchemaToTs = async server => {
  const generateLoginToken = async (request: FastifyRequest, id: number) => {
    const loginToken = server.jwt.sign({type: 'login', id, it: ++it});

    const {ip} = request;
    const userAgent = request.headers['user-agent'] || null;
    const expiresAt = Math.floor(Date.now() / 1000) + 10 * 60; // 10 min

    await server.db.run(SQL`
      INSERT INTO connections(user_id, ip, user_agent, access_token,
                  expires_at)
      VALUES(${id}, ${ip}, ${userAgent}, ${loginToken}, ${expiresAt})`);

    return loginToken;
  };

  server.post('/login', {schema}, async (request, reply) => {
    const {username, password} = request.body;
    const user = await server.db.get(SQL`
      SELECT id, password, totp_enabled AS totp FROM users WHERE lower(username) = lower(${username})
    `);

    if (!user || !compareSync(password, user.password))
      return reply.unauthorized('Invalid username or password');

    if (user.totp) {
      const accessToken = await generateLoginToken(request, user.id);
      return reply.send({accessToken, totp: true});
    }

    const {accessToken, refreshToken} = await request.generateTokens(user.id);
    return reply
      .setCookie('refreshToken', refreshToken)
      .send({accessToken, totp: false});
  });
};

export default plugin;
