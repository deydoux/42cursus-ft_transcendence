import {WebSocket} from '@fastify/websocket';

interface Client {
  userID: number;
  connection: number;
  socket: WebSocket;
}

type ClientTunnelMessage =
  | {
      type: 'joinMatchmaking';
      game: string;
      mode: string;
    }
  | {
      type: 'leaveMatchmaking';
    };

type ServerTunnelMessage =
  | {
      type: 'directMessage';
      sender: unknown;
      content: string;
    }
  | {
      type: 'error';
      message: string;
    }
  | {
      type: 'friendRequest' | 'friendRequestAccepted';
      user: unknown;
      relationship?: number;
    }
  | {
      type: 'hotReload';
    }
  | {
      type: 'matchEnd';
      winner: number;
      loser: number;
      draw: boolean;
      eloChange?: number;
    }
  | {
      type: 'matchStart';
      game: string;
      ranked: boolean;
      user: unknown;
      opponent: unknown;
    }
  | {
      type: 'success';
      origin: string;
    };
