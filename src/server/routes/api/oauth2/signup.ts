import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import {JWTDataSignup} from 'types/fastifyJWT';
import SQL from 'sql-template-strings';
import {username} from '#lib/schemas';

const schema = {
  body: {
    type: 'object',
    properties: {username},
    required: ['username'],
  } as const,
};

const plugin: FastifyPluginAsyncJsonSchemaToTs = async server => {
  server.addHook('onRequest', server.authenticate('signup'));

  const setAvatar = async (id: number, url: string | undefined) => {
    if (!url) return;

    const response = await fetch(url);
    if (!response.ok || !response.body) return;

    const buffer = await response.arrayBuffer();
    try {
      await server.storeAvatar(id, buffer);
    } catch (error) {
      server.log.warn(error);
    }
  };

  server.post('/google/signup', {schema}, async (request, reply) => {
    const {username} = request.body;
    await server.validateUsernameAvailability(username);

    const {id: googleID, avatar} = request.user as unknown as JWTDataSignup;
    const {lastID: id} = await server.db.run(
      SQL`INSERT INTO users(username, google_id) VALUES(${username}, ${googleID})`,
    );
    if (!id) throw new Error('Failed to create user');

    await setAvatar(id, avatar);
    await request.removeConnection();

    const {accessToken, refreshToken} = await request.generateTokens(id);
    return reply
      .setCookie('refreshToken', refreshToken)
      .send({accessToken})
      .code(201);
  });
};

export default plugin;
