import {WebSocket} from '@fastify/websocket';

interface Client {
  userID: number;
  connection: number;
  socket: WebSocket;
}

type ClientTunnelMessage =
  | {
      type: 'joinMatchmaking';
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
      type: 'success';
      origin: string;
    };
