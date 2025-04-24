import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import SQL from 'sql-template-strings';
import {compareSync} from 'bcrypt';

const schema = {
  body: {
    type: 'object',
    properties: {
      password: {type: 'string'},
    },
    required: ['password'],
  } as const,
};

const plugin: FastifyPluginAsyncJsonSchemaToTs = async server => {
  server.delete('', {schema}, async (request, reply) => {
    const {id} = request.user;

    const user = await server.db.get(
      SQL`SELECT password FROM users WHERE id = ${id}`,
    );

    const {password} = request.body;
    if (!user || !compareSync(password, user.password))
      throw server.httpErrors.unauthorized('Invalid password');

    await server.db.run(SQL`DELETE FROM users WHERE id = ${id}`);

    return reply.clearCookie('refreshToken').code(204).send();
  });
};

export default plugin;
