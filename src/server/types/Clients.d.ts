import {WebSocket} from '@fastify/websocket';

interface Client {
  userID: number;
  session: number;
  socket: WebSocket;
}

type ClientTunnelMessage =
  | {
      type: 'createTournament';
      name: string;
    }
  | {
      type: 'joinMatchmaking';
      game: string;
      mode: string;
      targetID?: number;
    }
  | {
      type: 'joinTournament';
      tournamentID: number;
    }
  | {
      type: 'leaveMatchmaking';
    }
  | {
      type: 'leaveTournament';
    }
  | {
      type: 'score';
      scorerID: number;
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
      type: 'gameInvite';
      game: string;
      user: unknown;
    }
  | {
      type: 'generalMessage';
      sender: unknown;
      content: string;
      mention: boolean;
    }
  | {
      type: 'matchCancel';
      cause?: string;
    }
  | {
      type: 'matchEnd';
      winner: number;
      result?: 'cancel' | 'forfeit' | 'tie';
      eloChange?: number;
    }
  | {
      type: 'matchStart';
      game: string;
      ranked: boolean;
      block: boolean;
      players: unknown[];
      dx: number;
      dy: number;
    }
  | {
      type: 'participantJoin';
      user: unknown;
    }
  | {
      type: 'participantLeft';
      userID: number;
      ownerID: number;
    }
  | {
      type: 'round';
      dx: number;
      dy: number;
    }
  | {
      type: 'success';
      origin: string;
    }
  | {
      type: 'tournamentMatchStart';
      id: number;
      participants: unknown[];
    }
  | {
      type: 'tournamentMatchEnd';
      id: number;
      winner?: unknown;
      result?: 'cancel' | 'empty' | 'forfeit' | 'tie';
    }
  | {
      type: 'tournamentStarted';
      rounds: unknown;
    };
