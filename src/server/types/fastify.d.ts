import {Database} from 'sqlite';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest) => Promise<void>;
    authenticateRefresh: (request: FastifyRequest) => Promise<void>;
    db: Database;
    dev: boolean;
    generateAccessToken: (userId: number) => string;
    generateTokens: (
      userId: number,
    ) => Promise<{accessToken: string; refreshToken: string}>;
    prod: boolean;
  }
}
