import {WebSocket} from '@fastify/websocket';

interface Client {
  userID: number;
  connection: number;
  socket: WebSocket;
}

type TunnelMessage =
  | {
      type: 'directMessage';
      sender: unknown;
      content: string;
    }
  | {
      type: 'error';
      message: string;
      origin?: string;
    }
  | {
      type: 'friendRequest' | 'friendRequestAccepted';
      user: unknown;
      relationship?: number;
    }
  | {
      type: 'hotReload';
    };
