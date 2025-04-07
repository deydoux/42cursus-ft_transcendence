import {Database} from 'sqlite3';
import {FastifyPluginAsync} from 'fastify';
import {open} from 'sqlite';
import fp from 'fastify-plugin';

const DB_FILE = process.env.DB_FILE || 'db.sqlite3';

const plugin: FastifyPluginAsync = async server => {
  const db = await open({
    filename: DB_FILE,
    driver: Database,
  });

  server.decorate('db', db);
  // server.addHook('onClose', async server => {
  //   await server.db.close();
  // });
};

export default fp(plugin);
