import {FastifyPluginAsync, FastifyRequest} from 'fastify';
import fastifyOauth2, {OAuth2Namespace} from '@fastify/oauth2';
import GoogleClient from '#lib/GoogleClient';
import SQL from 'sql-template-strings';

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
      'Google OAuth2 credentials are not set: GOOGLE_ID, GOOGLE_SECRET';

    if (server.prod) throw new Error(message);
    return server.log.warn(`${message}; skipping Google OAuth2 plugin`);
  }

  if (!BASE_URL) {
    const message = 'BASE_URL is not set environment variable';

    if (server.prod) throw new Error(message);

    BASE_URL = 'http://localhost:3000';
    server.log.warn(`${message}, using "${BASE_URL}" as default`);
  }

  await server.register(fastifyOauth2, {
    name: 'google',
    scope: ['email'],
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

  let it = 0;

  const generateSignupToken = async (
    request: FastifyRequest,
    info: GoogleUserInfo,
  ) => {
    const {sub: id, picture: avatar, email} = info;
    const nickname = email.split('@')[0];

    const signupToken = server.jwt.sign({
      type: 'signup',
      id,
      nickname,
      avatar,
      it: ++it,
    });

    const {ip} = request;
    const userAgent = request.headers['user-agent'] || null;
    const expiresAt = Math.floor(Date.now() / 1000) + 10 * 60; // 10 min

    await server.db.run(
      SQL`INSERT INTO connections(ip, user_agent, access_token, expires_at) VALUES(${ip}, ${userAgent}, ${signupToken}, ${expiresAt})`,
    );

    return signupToken;
  };

  server.get('/oauth2/google/callback', async function (request, reply) {
    let token;
    try {
      token = (
        await server.google.getAccessTokenFromAuthorizationCodeFlow(request)
      ).token;
    } catch {
      return reply.unauthorized('Invalid code');
    }

    const client = new GoogleClient(token.access_token);
    const info = await client.getUserInfo();

    const accessToken = await generateSignupToken(request, info);
    return reply.send({accessToken});
  });
};

export const autoPrefix = '/';
export default plugin;
