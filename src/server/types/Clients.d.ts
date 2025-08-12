import {WebSocket} from '@fastify/websocket';

interface Client {
  userID: number;
  session: number;
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
      type: 'directMessage' | 'generalMessage';
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
  | {type: 'hotReload'}
  | {
      type: 'matchCancel';
      cause?: string;
    }
  | {
      type: 'matchEnd';
      winner: number;
      draw: boolean;
      eloChange?: number;
    }
  | {
      type: 'matchStart';
      game: string;
      ranked: boolean;
      players: unknown[];
    }
  | {
      type: 'success';
      origin: string;
    };
