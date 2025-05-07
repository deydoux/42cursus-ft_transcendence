import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import SQL from 'sql-template-strings';

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
  server.delete('/', async (request, reply) => {
    const {connection} = request;
    const {id} = request.user;

    await server.db.run(
      SQL`DELETE FROM connections WHERE id != ${connection} AND user_id = ${id}`,
    );
    server.clients.closeId(id, connection);

    return reply.code(204).send();
  });

  server.delete('/:id', {schema}, async (request, reply) => {
    const {id} = request.params;
    const {id: userId} = request.user;

    const connection = await server.db.get(
      SQL`SELECT user_id FROM connections WHERE id = ${id} AND user_id = ${userId}`,
    );

    if (!connection) return reply.notFound('Connection not found');

    await server.db.run(
      SQL`DELETE FROM connections WHERE id = ${id} AND user_id = ${userId}`,
    );
    server.clients.closeConnection(id);

    return reply.code(204).send();
  });
};

export default plugin;
