import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';

const plugin: FastifyPluginAsync = async server => {
  server.decorateRequest('removeConnection', async function () {
    const id = this.connection;
    if (id === null) return;

    await server.db.run(SQL`
      DELETE FROM connections
      WHERE id = ${id}
    `);
    server.clients.closeConnection(id);
    this.connection = null;
  });
};

export default plugin;
