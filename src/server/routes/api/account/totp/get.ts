import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';
import {TOTP} from 'otpauth';

const {DOMAIN_NAME} = process.env;

const plugin: FastifyPluginAsync = async server => {
  server.get('/', async (request, reply) => {
    const {id} = request.user;

    const user = await server.db.get(
      SQL`SELECT username, totp_enabled AS totp FROM users WHERE id = ${id}`,
    );

    if (!user) return reply.notFound('Account not found');
    if (user.totp) return reply.badRequest('TOTP already enabled');

    const totp = new TOTP({
      issuer: DOMAIN_NAME || 'ft_transcendence',
      label: user.username,
    });

    const secret = totp.secret.base32;
    await server.db.run(
      SQL`UPDATE users SET totp_secret = ${secret} WHERE id = ${id}`,
    );

    const uri = totp.toString();
    return reply.send({uri, secret});
  });
};

export default plugin;
