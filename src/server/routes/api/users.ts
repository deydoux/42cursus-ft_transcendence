import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import SQL from 'sql-template-strings';
import fp from 'fastify-plugin';

const schema = {
  params: {
    type: 'object',
    properties: {
      userId: {type: 'number'},
    },
    required: ['userId'],
  } as const,
};

const plugin: FastifyPluginAsyncJsonSchemaToTs = async server => {
  async function getUser(userId: number) {
    const user = await server.db.get(
      SQL`SELECT id, username FROM users WHERE id = ${userId}`,
    );

    if (!user) throw server.httpErrors.notFound('User not found');

    return user;
  }

  server.get(
    '/api/users/:userId',
    {schema, onRequest: server.authenticate},
    async (request, reply) => reply.send(await getUser(request.params.userId)),
  );

  server.get(
    '/api/users/me',
    {onRequest: server.authenticate},
    async (request, reply) => reply.send(await getUser(request.user.id)),
  );
};

export default fp(plugin);
