import {Database} from 'sqlite';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest) => Promise<void>;
    authenticateRefresh: (request: FastifyRequest) => Promise<void>;
    db: Database;
    dev: boolean;
    generateTokens: (
      userId: number,
    ) => Promise<{accessToken: string; refreshToken: string}>;
    prod: boolean;
  }
}
