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
  server.put('/', {schema}, async (request, reply) => {
    const {id} = request.user;
    const user = await server.db.get(SQL`
      SELECT totp_enabled AS totp, totp_secret AS secret
      FROM users
      WHERE id = ${id}`);

    if (!user) return reply.notFound('Account not found');
    if (user.totp) return reply.badRequest('TOTP already enabled');

    const {secret} = user;
    const {token} = request.body;
    server.validateTOTP(secret, token);

    await server.db.run(SQL`
      UPDATE users
      SET totp_enabled = TRUE, totp_secret = ${secret}
      WHERE id = ${id}`);

    return reply.code(204).send();
  });
};

export default plugin;
