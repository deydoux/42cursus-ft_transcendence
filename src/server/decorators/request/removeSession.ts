import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';

const plugin: FastifyPluginAsync = async server => {
  server.decorateRequest('removeSession', async function () {
    const id = this.session;
    if (id === null) return;

    await server.db.run(SQL`
      DELETE FROM sessions
      WHERE id = ${id}
    `);
    server.clients.closeSession(id);
    this.session = null;
  });
};

export default plugin;
