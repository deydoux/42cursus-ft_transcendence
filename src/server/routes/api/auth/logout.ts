import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';

const plugin: FastifyPluginAsync = async server => {
  server.addHook('onRequest', server.authenticateRefresh);

  server.post('/logout', async (request, reply) => {
    const {connection} = request;

    await server.db.run(SQL`DELETE FROM connections WHERE id = ${connection}`);
    server.clients.closeConnection(connection);

    return reply.clearCookie('refreshToken').code(204).send();
  });
};

export default plugin;
