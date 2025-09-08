import {FastifyPluginAsync} from 'fastify';
import {OAuth2Client} from 'google-auth-library';

const {GOOGLE_ID} = process.env;

const plugin: FastifyPluginAsync = async server => {
  if (!GOOGLE_ID) {
    const message = 'GOOGLE_ID environment variable is not set';
    if (server.prod) throw new Error(message);
    return server.log.warn(`${message}, Google Sign In disabled`);
  }

  const client = new OAuth2Client();

  server.decorate('verifyGoogle', async token => {
    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken: token,
        audience: GOOGLE_ID,
      });
    } catch {
      return;
    }

    const payload = ticket.getPayload();

    return payload;
  });
};

export default plugin;
