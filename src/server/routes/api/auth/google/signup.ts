import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import SQL from 'sql-template-strings';
import {username} from '#lib/schemas';

const schema = {
  body: {
    type: 'object',
    properties: {
      username,
      token: {type: 'string'},
    },
    required: ['username', 'token'],
  } as const,
};

const plugin: FastifyPluginAsyncJsonSchemaToTs = async server => {
  if (!server.verifyGoogle) return;

  const setAvatar = async (id: number, url?: string) => {
    if (!url) return;

    url = url.replace(/=s96-c$/, '=s1024-c');
    const response = await fetch(url);
    if (!response.ok || !response.body) return;

    const buffer = await response.arrayBuffer();

    try {
      await server.storeAvatar(id, buffer);
    } catch (error) {
      server.log.warn(error);
    }
  };

  server.post('/signup', {schema}, async (request, reply) => {
    const {username} = request.body;
    await server.validateUsernameAvailability(username);

    const payload = await server.verifyGoogle(request.body.token);
    if (!payload) return reply.unauthorized('Invalid token');

    const user = await server.db.get(SQL`
      SELECT id
      FROM users
      WHERE google_sub = ${payload.sub}
    `);
    if (user) return reply.conflict('Google account already signed up');

    const {lastID: id} = await server.db.run(SQL`
      INSERT INTO users(google_sub, username)
      VALUES(${payload.sub}, ${username})
    `);
    if (!id) throw new Error('Failed to create user');

    await setAvatar(id, payload.picture);

    const {accessToken, refreshToken} = await request.generateTokens(id);
    return reply
      .setCookie('refreshToken', refreshToken)
      .send({accessToken})
      .code(201);
  });
};

export default plugin;
