import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';

const plugin: FastifyPluginAsync = async server => {
  server.decorateRequest('removeConnection', async function () {
    if (this.connection === null) return;

    await server.db.run(SQL`
      DELETE FROM connections WHERE id = ${this.connection}`);
    server.clients.closeConnection(this.connection);
    this.connection = null;
  });
};

export default plugin;
