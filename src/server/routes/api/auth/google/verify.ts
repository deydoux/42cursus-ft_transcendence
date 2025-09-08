import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import SQL from 'sql-template-strings';

const schema = {
  body: {
    type: 'object',
    properties: {
      token: {type: 'string'},
    },
    required: ['token'],
  } as const,
};

const plugin: FastifyPluginAsyncJsonSchemaToTs = async server => {
  if (!server.verifyGoogle) return;

  server.post('/verify', {schema}, async (request, reply) => {
    const payload = await server.verifyGoogle(request.body.token);
    if (!payload) return reply.unauthorized('Invalid token');

    const user = await server.db.get(SQL`
      SELECT id
      FROM users
      WHERE google_sub = ${payload.sub}
    `);
    if (!user) return reply.send({accessToken: null});

    const {accessToken, refreshToken} = await request.generateTokens(user.id);
    return reply.setCookie('refreshToken', refreshToken).send({accessToken});
  });
};

export default plugin;
