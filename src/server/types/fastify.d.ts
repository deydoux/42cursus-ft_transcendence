import {Database} from 'sqlite';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest) => Promise<void>;
    authenticateRefresh: (request: FastifyRequest) => Promise<void>;
    db: Database;
    dev: boolean;
    prod: boolean;
  }

  interface FastifyRequest {
    connection: number | null;
    generateAccessToken: (id: number, refreshToken?: string) => Promise<string>;
    generateTokens: (
      id: number,
    ) => Promise<{accessToken: string; refreshToken: string}>;
  }
}
