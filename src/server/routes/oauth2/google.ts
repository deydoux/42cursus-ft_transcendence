import fastifyOauth2, {OAuth2Namespace} from '@fastify/oauth2';
import {FastifyPluginAsync} from 'fastify';

declare module 'fastify' {
  interface FastifyInstance {
    google: OAuth2Namespace;
  }
}

const {GOOGLE_ID, GOOGLE_SECRET} = process.env;
let {BASE_URL} = process.env;

const plugin: FastifyPluginAsync = async server => {
  if (!GOOGLE_ID || !GOOGLE_SECRET) {
    const message =
      'Google OAuth2 credentials are not set: BASE_URL, GOOGLE_ID, GOOGLE_SECRET';
    if (server.prod) throw new Error(message);
    return server.log.warn(message);
  }

  if (!BASE_URL) {
    const message = 'BASE_URL is not set environment variable';

    if (server.prod) throw new Error(message);

    BASE_URL = 'http://localhost:3000';
    server.log.warn(`${message}, using "${BASE_URL}" as default`);
  }

  await server.register(fastifyOauth2, {
    name: 'google',
    scope: ['profile'],
    credentials: {
      client: {
        id: GOOGLE_ID,
        secret: GOOGLE_SECRET,
      },
      auth: fastifyOauth2.GOOGLE_CONFIGURATION,
    },
    startRedirectPath: '/oauth2/google',
    callbackUri: `${BASE_URL}/oauth2/google/callback`,
  });

  server.get('/oauth2/google/callback', async function (request, reply) {
    const {token} =
      await server.google.getAccessTokenFromAuthorizationCodeFlow(request);

    console.log(token);

    // if later need to refresh the token this can be used
    // const { token: newToken } = await this.getNewAccessTokenUsingRefreshToken(token)

    reply.send({access_token: token.access_token});
  });
};

export const autoPrefix = '/';
export default plugin;
