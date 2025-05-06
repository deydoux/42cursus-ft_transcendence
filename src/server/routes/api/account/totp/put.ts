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
  server.put('/', {schema}, async (request, reply) => {
    const {id} = request.user;
    const account = await server.db.get(
      SQL`SELECT totp_enabled AS totp, totp_secret AS secret FROM users WHERE id = ${id}`,
    );

    if (!account) return reply.notFound('Account not found');
    if (account.totp) return reply.badRequest('TOTP already enabled');
    if (!account.secret) return reply.badRequest('TOTP secret not generated');

    const totp = new TOTP({secret: account.secret});
    const {token} = request.body;
    if (totp.validate({token}) === null)
      return reply.badRequest('Invalid TOTP code');

    await server.db.run(
      SQL`UPDATE users SET totp_enabled = 1 WHERE id = ${id}`,
    );

    return reply.code(204).send();
  });
};

export default plugin;
