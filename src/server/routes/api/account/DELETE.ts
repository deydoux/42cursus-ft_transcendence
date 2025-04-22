import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import SQL from 'sql-template-strings';
import fp from 'fastify-plugin';
import hash from '#lib/hash';

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
  server.delete(
    '/api/account',
    {schema, onRequest: server.authenticate},
    async (request, reply) => {
      const password = hash(request.body.password);

      const user = await server.db.get(
        SQL`SELECT id FROM users WHERE id = ${request.user.id} AND password = ${password}`,
      );

      if (!user) throw server.httpErrors.unauthorized('Invalid password');

      await server.db.run(SQL`DELETE FROM users WHERE id = ${request.user.id}`);

      return reply.clearCookie('refreshToken').code(204).send();
    },
  );
};

export default fp(plugin);
