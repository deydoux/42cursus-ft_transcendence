import {Database} from 'sqlite';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest) => Promise<void>;
    authenticateRefresh: (request: FastifyRequest) => Promise<void>;
    db: Database;
    dev: boolean;
    paths: {
      avatars: string;
      cache: string;
      data: string;
      db: string;
      dist: string;
      static: string;
    };
    prod: boolean;
    validateUsernameAvailability: (
      username: string,
      id?: number,
    ) => Promise<void>;
  }

  interface FastifyRequest {
    connection: number | null;
    generateAccessToken: (id: number) => Promise<string>;
    generateTokens: (
      id: number,
    ) => Promise<{accessToken: string; refreshToken: string}>;
  }
}
