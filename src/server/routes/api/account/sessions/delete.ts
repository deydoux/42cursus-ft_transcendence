import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import SQL from 'sql-template-strings';
import {idParamsSchema as schema} from '#lib/schemas';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async server => {
  server.delete('/', async (request, reply) => {
    const {session, user} = request;

    await server.db.run(SQL`
      DELETE FROM sessions
      WHERE id != ${session} AND user_id = ${user.id}
    `);
    server.clients.closeUser(user.id, session);

    return reply.code(204).send();
  });

  server.delete('/:id', {schema}, async (request, reply) => {
    const {user} = request;
    const {id} = request.params;

    const {changes} = await server.db.run(SQL`
      DELETE FROM sessions
      WHERE id = ${id} AND user_id = ${user.id}
    `);
    if (!changes) return reply.notFound('session not found');

    server.clients.closeSession(id);

    return reply.code(204).send();
  });
};

export default plugin;
