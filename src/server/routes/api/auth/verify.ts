import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import SQL from 'sql-template-strings';
import {TOTP} from 'otpauth';

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
  server.addHook('onRequest', async (request, reply) => {
    await request.jwtVerify();

    if (request.user.type !== 'login')
      return reply.unauthorized('Invalid token type');
  });

  server.post('/verify', {schema}, async (request, reply) => {
    const {id} = request.user;
    const user = await server.db.get(
      SQL`SELECT totp_enabled AS totp, totp_secret AS secret FROM users WHERE id = ${id}`,
    );

    if (!user) return reply.notFound('Account not found');
    if (!user.totp) return reply.badRequest('TOTP is not enabled');

    const {secret} = user;
    if (!secret) return reply.badRequest('TOTP secret not generated');

    const totp = new TOTP({secret});
    const {token} = request.body;
    if (totp.validate({token}) === null)
      return reply.unauthorized('Invalid TOTP code');

    const {connection} = request;
    await server.db.run(SQL`DELETE FROM connections WHERE id = ${connection}`);

    const {accessToken, refreshToken} = await request.generateTokens(id);
    return reply
      .setCookie('refreshToken', refreshToken)
      .send({accessToken})
      .code(201);
  });
};

export default plugin;
