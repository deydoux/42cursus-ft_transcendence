import {FastifyPluginAsyncJsonSchemaToTs} from '@fastify/type-provider-json-schema-to-ts';
import SQL from 'sql-template-strings';
import {idParamsSchema as schema} from '#lib/schemas';

const plugin: FastifyPluginAsyncJsonSchemaToTs = async server => {
  server.get('/', {schema}, async (request, reply) => {
    const {id} = request.params;

    const pong = await server.db.get(SQL`
      SELECT value
      FROM elo
      WHERE user_id = ${id} AND game = 'pong'
      ORDER BY id DESC
      LIMIT 1
    `);

    const race = await server.db.get(SQL`
      SELECT value
      FROM elo
      WHERE user_id = ${id} AND game = 'race'
      ORDER BY id DESC
      LIMIT 1
    `);

    if (!pong || !race) return reply.notFound('User not found');

    return reply.send({
      pong: pong.value,
      race: race.value,
    });
  });
};

export default plugin;
