import {User} from '../handlers/game';
export interface user {
  id: number;
  username: string;
  avatar: string;
  status?: string | null;
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
  matchmakingTargetUser?: user;
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

  loading: string[];

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
    invite?: null | string;
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
      status?: string | null;
    };
    messages: {
      id: number;
      senderID: number;
      content: string;
      createdAt: string;
    }[];
    invite: null | 'race' | 'pong';
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
    isRanked: boolean;
    id: number;
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
  matches: {
    game: string;
    mode: string;
    result: string;
    createdAt: string;
    updatedAt: string;
    eloChange: number;
    winner: {
      id: number;
      username: string;
      avatar: string;
      score: number;
      elo: number;
    };
    loser: {
      id: number;
      username: string;
      avatar: string;
      score: number;
      elo: number;
    };
  }[];
  elo: {
    game: string;
    value: number;
    createdAt: string;
  }[];
  streaks: {
    pong: {
      casual: {
        current: number;
        best: number;
        winRate: number;
        totalMatches: number;
      };
      ranked: {
        current: number;
        best: number;
        winRate: number;
        totalMatches: number;
      };
    };
    race: {
      casual: {
        current: number;
        best: number;
        winRate: number;
        totalMatches: number;
      };
      ranked: {
        current: number;
        best: number;
        winRate: number;
        totalMatches: number;
      };
    };
  };
}

export interface Component {
  render(): HTMLElement | undefined;
  destroy?(): void;
}
