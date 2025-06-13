import {password, username} from '#lib/schemas';
import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import SQL from 'sql-template-strings';
import hash from '#lib/hash';

const schema = {
  body: {
    type: 'object',
    properties: {username, password},
    required: ['username', 'password'],
  } as const,
};

const plugin: FastifyPluginAsyncJsonSchemaToTs = async server => {
  server.post('/signup', {schema}, async (request, reply) => {
    const {username} = request.body;
    await server.validateUsernameAvailability(username);

    const password = hash(request.body.password);

    const {lastID: id} = await server.db.run(SQL`
      INSERT INTO users(username, password)
      VALUES(${username}, ${password})
    `);
    if (!id) throw new Error('Failed to create user');

    const {accessToken, refreshToken} = await request.generateTokens(id);
    return reply
      .setCookie('refreshToken', refreshToken)
      .send({accessToken})
      .code(201);
  });
};

export default plugin;
