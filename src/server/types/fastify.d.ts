import {Client} from '#types/Clients';
import Clients from '#lib/Clients';
import {Database} from 'sqlite';
import {SharpInput} from 'sharp';
import {WebSocket} from '@fastify/websocket';

interface RankedClient extends Client {
  elo: number;
  lowerElo: number;
  upperElo: number;
  timeout?: NodeJS.Timeout;
}

interface Queue {
  casual: Client | null;
  invites: {client: Client; other: number}[];
  ranked: RankedClient[];
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (
      scope?: string,
    ) => (request: FastifyRequest) => Promise<void>;
    authenticateRefresh: (request: FastifyRequest) => Promise<void>;
    clients: Clients;
    db: Database;
    dev: boolean;
    game: {
      players: Record<number, number>;
      queues: {
        pong: Queue;
        race: Queue;
      };
    };
    leaveMatchmaking: (socket: WebSocket) => void;
    paths: {
      avatars: string;
      cache: string;
      data: string;
      db: string;
      dist: string;
      static: string;
    };
    prod: boolean;
    removeAvatar: (id: number) => Promise<void>;
    storeAvatar: (id: number, avatar: SharpInput) => Promise<void>;
    validateTOTP: (secret: string, token: string) => void;
    validateUsernameAvailability: (
      username: string,
      id?: number,
    ) => Promise<void>;
  }

  interface FastifyRequest {
    session: number | null;
    generateAccessToken: (id: number, scope?: string) => Promise<string>;
    generateTokens: (
      id: number,
    ) => Promise<{accessToken: string; refreshToken: string}>;
    removeSession: () => Promise<void>;
  }
}
