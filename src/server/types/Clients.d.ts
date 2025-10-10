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
      type: 'kickParticipant';
      participantID: number;
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
      time: number;
      dx?: number;
      dy?: number;
    }
  | {
      type: 'newTournament';
      tournament: unknown;
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
      time: number;
      dx?: number;
      dy?: number;
    }
  | {
      type: 'success';
      origin: string;
    }
  | {
      type: 'tournamentJoined';
      participants: unknown[];
    }
  | {
      type: 'tournamentMatchStart';
      roundID: number;
      participants: unknown[];
    }
  | {
      type: 'tournamentMatchEnd';
      roundID: number;
      nextRoundID?: number;
      winnerID?: number;
      participants: unknown[];
      result?: 'cancel' | 'empty' | 'forfeit' | 'tie';
    }
  | {
      type: 'tournamentStarted';
      final: unknown;
    };
