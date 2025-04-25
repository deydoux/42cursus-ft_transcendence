import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import SQL from 'sql-template-strings';
import fp from 'fastify-plugin';

const schema = {
  params: {
    type: 'object',
    properties: {
      id: {type: 'number'},
    },
    required: ['id'],
  } as const,
};

const plugin: FastifyPluginAsyncJsonSchemaToTs = async server => {
  async function getUser(id: number) {
    const user = await server.db.get(
      SQL`SELECT id, username FROM users WHERE id = ${id}`,
    );

    if (!user) throw server.httpErrors.notFound('User not found');

    return user;
  }

  server.get(
    '/api/users/:id',
    {schema, onRequest: server.authenticate},
    async (request, reply) => reply.send(await getUser(request.params.id)),
  );

  server.get(
    '/api/users/me',
    {onRequest: server.authenticate},
    async (request, reply) => reply.send(await getUser(request.user.id)),
  );
};

export default fp(plugin);
