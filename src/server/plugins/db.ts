import * as sqlite3 from 'sqlite3';
import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';
import {mkdir} from 'node:fs/promises';
import {open} from 'sqlite';

const plugin: FastifyPluginAsync = async server => {
  await mkdir(server.paths.cache, {recursive: true});
  await mkdir(server.paths.avatars, {recursive: true});

  const filename = server.paths.db;
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

  server.decorate('db', db);

  server.addHook('onClose', async server => {
    await server.db.close();
  });
};

export default plugin;
