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
  server.addHook('onRequest', server.authenticate('totp'));

  server.post('/verify', {schema}, async (request, reply) => {
    const {id} = request.user;
    const user = await server.db.get(SQL`
      SELECT totp_enabled AS totp, totp_secret AS secret
      FROM users
      WHERE id = ${id}
    `);

    if (!user) return reply.notFound('Account not found');
    if (!user.totp) return reply.badRequest('TOTP is not enabled');

    const {secret} = user;
    const {token} = request.body;
    server.validateTOTP(secret, token);

    const {accessToken, refreshToken} = await request.generateTokens(id);
    return reply
      .setCookie('refreshToken', refreshToken)
      .send({accessToken})
      .code(201);
  });
};

export default plugin;
