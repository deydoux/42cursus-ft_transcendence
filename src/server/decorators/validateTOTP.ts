import {FastifyPluginAsync} from 'fastify';
import {TOTP} from 'otpauth';

const plugin: FastifyPluginAsync = async server => {
  server.decorate('validateTOTP', (secret, token) => {
    if (!secret)
      throw server.httpErrors.badRequest('TOTP secret not generated');

    const totp = new TOTP({secret});
    if (totp.validate({token}) === null)
      throw server.httpErrors.unauthorized('Invalid TOTP code');
  });
};

export default plugin;
