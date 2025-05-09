import * as sqlite3 from 'sqlite3';
import {mkdir, rm} from 'node:fs/promises';
import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';
import {open} from 'sqlite';

const plugin: FastifyPluginAsync = async server => {
  await rm(server.paths.cache, {recursive: true, force: true});
  await mkdir(server.paths.cache, {recursive: true});
  await mkdir(server.paths.avatars, {recursive: true});

  const filename = server.paths.db;
  const db = await open({filename, driver: sqlite3.verbose().Database});

  await db.run('PRAGMA foreign_keys = ON');
  await db.migrate();

  db.on('trace', (sql: string) => {
    server.log.trace(`${filename}: ${sql}`);
  });

  const clean = () => {
    server.log.info('Cleaning database');
    db.run(
      SQL`DELETE FROM users WHERE last_seen <= unixepoch() - 2 * 365 * 24 * 60 * 60`, // 2 years
    );
    db.run(SQL`DELETE FROM connections WHERE expires_at <= unixepoch()`);
  };

  clean();
  setInterval(clean, 10 * 60 * 1000); // 10 min

  server.decorate('db', db);

  server.addHook('onClose', async server => {
    await server.db.close();
  });
};

export default plugin;
