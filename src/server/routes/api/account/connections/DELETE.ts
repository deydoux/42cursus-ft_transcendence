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
  server.delete(
    '/api/account/connections/:id',
    {schema, onRequest: server.authenticate},
    async (request, reply) => {
      const {id} = request.params;

      const connection = await server.db.get(
        SQL`SELECT user_id FROM connections WHERE id = ${id}`,
      );

      if (!connection) throw server.httpErrors.notFound('Connection not found');
      if (connection.user_id !== request.user.id)
        throw server.httpErrors.forbidden(
          'You do not have permission to delete this connection',
        );

      await server.db.run(SQL`DELETE FROM connections WHERE id = ${id}`);
      return reply.code(204).send();
    },
  );

  server.delete(
    '/api/account/connections',
    {onRequest: server.authenticate},
    async (request, reply) => {
      await server.db.run(
        SQL`DELETE FROM connections WHERE id != ${request.connection} AND user_id = ${request.user.id}`,
      );

      return reply.code(204).send();
    },
  );
};

export default fp(plugin);
