import {Database} from 'sqlite';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest) => Promise<void>;
    db: Database;
  }
}
