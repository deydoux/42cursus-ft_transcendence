import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import fp from 'fastify-plugin';
import SQL from 'sql-template-strings';

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
      SQL`SELECT username FROM users WHERE id = ${userId}`,
    );

    if (!user) throw server.httpErrors.notFound('User not found');

    const {username} = user;
    return {username};
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
