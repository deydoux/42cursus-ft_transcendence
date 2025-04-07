import {Database} from 'sqlite3';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest) => Promise<void>;
    db: Database;
  }
}
