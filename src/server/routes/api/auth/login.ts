import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import fp from 'fastify-plugin';
import hash from '#lib/hash';
import SQL from 'sql-template-strings';

const schema = {
  body: {
    type: 'object',
    properties: {
      username: {type: 'string'},
      password: {type: 'string'},
    },
    required: ['username', 'password'],
    additionalProperties: false,
  } as const,
};

const plugin: FastifyPluginAsyncJsonSchemaToTs = async server => {
  server.post('/api/auth/login', {schema}, async (request, reply) => {
    const {username} = request.body;
    const password = hash(request.body.password);

    const user = await server.db.get(SQL`
      SELECT id FROM users WHERE username = ${username} AND password = ${password}
    `);

    if (!user)
      throw server.httpErrors.unauthorized('Invalid username or password');

    const {id} = user;
    const refreshToken = server.jwt.sign(
      {id, type: 'refresh'},
      {expiresIn: '30d'},
    );
    const accessToken = server.jwt.sign({id, type: 'access'});

    await server.db.run(
      SQL`INSERT INTO tokens (refresh, access, user_id) VALUES (${refreshToken}, ${accessToken}, ${id})`,
    );

    return reply.setCookie('refreshToken', refreshToken).send({accessToken});
  });
};

export default fp(plugin);
