import * as sqlite3 from 'sqlite3';
import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';
import {join} from 'node:path';
import {mkdirSync} from 'node:fs';
import {open} from 'sqlite';

let {DATA_PATH} = process.env;

const plugin: FastifyPluginAsync = async server => {
  if (!DATA_PATH) {
    const message = 'DATA_PATH environment variable is not set';

    if (server.dev) {
      DATA_PATH = 'data';
      server.log.warn(`${message}, using "${DATA_PATH}" as default`);
      mkdirSync(DATA_PATH, {recursive: true});
    } else throw new Error(message);
  }

  const filename = join(DATA_PATH, 'db.sqlite');
  const db = await open({filename, driver: sqlite3.verbose().Database});

  await db.run('PRAGMA foreign_keys = ON');
  await db.migrate();

  const clean = () => {
    server.log.info('Cleaning database');
    db.run(SQL`DELETE FROM connections WHERE expires_at <= unixepoch()`);
  };

  clean();
  setInterval(clean, 60 * 60 * 1000); // 1 hour

  db.on('trace', (sql: string) => {
    server.log.trace(`${filename}: ${sql}`);
  });
  server.log.trace(`${filename}: HELLO`);

  server.decorate('db', db);

  server.addHook('onClose', async server => {
    await server.db.close();
  });
};

export default plugin;
