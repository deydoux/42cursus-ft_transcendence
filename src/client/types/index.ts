import {User} from '../handlers/game';
export interface user {
  id: number;
  username: string;
  avatar: string;
}

export interface round {
  id: number;
  participants: (user & {score?: number})[];
  rounds: round[];
  winnerID?: number;
  result?: 'forfeit' | 'cancel' | 'tie' | 'empty';
}

export interface AppState {
  currentRoute: string;
  isWaitingForMatchmaking: boolean;
  totpCode?: {
    uri: string;
    secret: string;
  };
  user?: {
    id: number;
    username: string;
    passwordEditedAt: string;
    totp: boolean; // 2FA
    hasAvatar: boolean;
    avatar: string;
    elo: number;
  };

  chatView: {
    label: string;
    id?: number;
  };
  directChats: {
    relationshipID?: number;
    updatedAt: string;
    content: string;
    unread?: number;
    user: user;
    invite?: string;
  }[];
  generalChat?: {
    content: string;
    createdAt: string;
    user: user;
  };
  countFriendRequests: number;
  chatsSearchQuery: string;
  discussion?: {
    user: {
      id: number;
      username: string;
      lastSeen: string;
      avatar: string;
      online: boolean;
    };
    messages: {
      id: number;
      senderID: number;
      content: string;
      createdAt: string;
    }[];
    next: string;
  };
  generalDiscussion?: {
    users: Record<string, user>;
    messages: {
      id: number;
      userID: number;
      content: string;
      createdAt: string;
      mention?: boolean;
    }[];
    next: string;
  };

  friendRequests: {
    relationshipID: number;
    createdAt: string;
    id: number;
    username: string;
    avatar: string;
  }[];
  sentFriendRequests: {
    relationshipID: number;
    createdAt: string;
    id: number;
    username: string;
    avatar: string;
  }[];

  blockedUsers: {
    relationshipID: number;
    createdAt: string;
    id: number;
    username: string;
  }[];
  sessions: {
    session: number;
    sessions: {
      id: number;
      ip: string;
      userAgent: {
        ua: string;
        browser: {name: string};
        device: {model: string; vendor: string};
      };
      createdAt: string;
      updatedAt: string;
    }[];
  };

  tournamentView: 'tournaments' | 'lobby';
  tournaments: {
    id: number;
    name: string;
    participantCount: number;
    owner: user;
  }[];
  joinedTournament?: {
    id?: number;
    name: string;
    participantCount: number;
    owner: user;
    participants: user[];
    rounds?: round;
    winner?: user;
  };

  publicKPIs: {
    totalUsers: number;
    totalGames: number;
    bestPlayer: string;
  };
  players: [User, User];
  isOpponentBlocked: boolean;
  matchStartBallData: {dx: number; dy: number};
  game: {
    startTime: number;
    name: string;
    isLocal: boolean;
    players: [User, User];
  };
  raceWalls: {
    x: number;
    y: number;
    width: number;
    height: number;
  }[];
}

export interface Component {
  render(): HTMLElement | undefined;
  destroy?(): void;
}
