import Match, {Player} from '#lib/Match';
import {Client} from '#types/Clients';
import Clients from '#lib/Clients';
import {Database} from 'sqlite';
import {SharpInput} from 'sharp';
import {Tournament} from '#lib/Tournament';
import {Tournaments} from '#lib/Tournaments';
import {WebSocket} from '@fastify/websocket';

interface RankedClient extends Client {
  elo: number;
  lowerElo: number;
  upperElo: number;
  timeout?: NodeJS.Timeout;
}

interface Queue {
  casual: Player | null;
  invites: {player: Player; other: number}[];
  ranked: RankedClient[];
}

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (
      scope?: string,
    ) => (request: FastifyRequest) => Promise<void>;
    authenticateRefresh: (request: FastifyRequest) => Promise<void>;
    blockUser: (
      request: FastifyRequest,
      reply: FastifyReply,
      other?: {id: number; username: string},
    ) => Promise<void>;
    clients: Clients;
    db: Database;
    dev: boolean;
    friendRequest: (
      request: FastifyRequest,
      reply: FastifyReply,
      other: {
        id: number;
        username: string;
        has_avatar: boolean;
        avatar_version: number;
      },
    ) => Promise<void>;
    game: {
      players: Record<number, {match?: Match | Tournament; opponent?: number}>;
      queues: {
        pong: Queue;
        race: Queue;
      };
    };
    getUserInvite: (user: number, other: number) => string | null;
    getUserStatus: (id: number) => string | null;
    leaveMatchmaking: (socket: WebSocket) => void;
    paths: {
      avatars: string;
      cache: string;
      data: string;
      db: string;
      dist: string;
      static: string;
    };
    playAvailability: (client: Client) => void;
    prod: boolean;
    removeAvatar: (id: number) => Promise<void>;
    storeAvatar: (id: number, avatar: SharpInput) => Promise<void>;
    tournaments: Tournaments;
    validateTOTP: (secret: string, token: string) => void;
    validateUsernameAvailability: (
      username: string,
      id?: number,
    ) => Promise<void>;
    verifyGoogle: (token: string) => Promise<TokenPayload?>;
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
