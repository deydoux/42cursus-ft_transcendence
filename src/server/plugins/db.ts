import {FastifyPluginAsync} from 'fastify';
import {open} from 'sqlite';
import * as sqlite3 from 'sqlite3';
import fp from 'fastify-plugin';

let {DB_PATH} = process.env;

const plugin: FastifyPluginAsync = async server => {
  if (!DB_PATH) {
    const message = 'DB_PATH environment variable is not set';

    if (server.dev) {
      DB_PATH = 'ft_transcendence.db';
      server.log.warn(`${message}, using "${DB_PATH}" as default`);
    } else throw new Error(message);
  }

  const db = await open({
    filename: DB_PATH,
    driver: sqlite3.verbose().Database,
  });

  db.on('trace', (sql: string) => {
    server.log.trace(`${DB_PATH}: ${sql}`);
  });

  server.decorate('db', db);

  server.addHook('onClose', async server => {
    await server.db.close();
  });
};

export default fp(plugin);
