import * as sqlite3 from 'sqlite3';
import {FastifyPluginAsync} from 'fastify';
import SQL from 'sql-template-strings';
import {join} from 'node:path';
import {mkdir} from 'node:fs/promises';
import {open} from 'sqlite';

const plugin: FastifyPluginAsync = async server => {
  await mkdir(join(server.paths.data, 'cache'), {recursive: true});
  await mkdir(join(server.paths.data, 'avatars'), {recursive: true});

  const filename = join(server.paths.data, 'db.sqlite');
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
