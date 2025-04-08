import {FastifyPluginAsync} from 'fastify';
import {open} from 'sqlite';
import * as sqlite3 from 'sqlite3';
import fp from 'fastify-plugin';

const DB_FILE = process.env.DB_FILE || 'ft_transcendence.db';

const plugin: FastifyPluginAsync = async server => {
  const db = await open({
    filename: DB_FILE,
    driver: sqlite3.verbose().Database,
  });

  db.on('trace', (sql: string) => {
    server.log.trace(`SQL: ${sql}`);
  });

  server.decorate('db', db);

  server.addHook('onClose', async server => {
    await server.db.close();
  });
};

export default fp(plugin);
