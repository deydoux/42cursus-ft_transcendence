import * as sqlite3 from 'sqlite3';
import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';
import {open} from 'sqlite';

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

  await db.run('PRAGMA foreign_keys = ON');
  await db.migrate();

  const clean = () => {
    server.log.info('Cleaning database');
    db.run(SQL`DELETE FROM connections WHERE expires_at <= unixepoch()`);
  };

  clean();
  setInterval(clean, 60 * 60 * 1000); // 1 hour

  db.on('trace', (sql: string) => {
    server.log.trace(`${DB_PATH}: ${sql}`);
  });

  server.decorate('db', db);

  server.addHook('onClose', async server => {
    await server.db.close();
  });
};

export default plugin;
