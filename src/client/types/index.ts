import {User} from '../handlers/game';

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
    user: {
      id: number;
      username: string;
      avatar: string;
    };
    invite?: string;
  }[];
  generalChat?: {
    content: string;
    createdAt: string;
    user: {
      id: number;
      username: string;
      avatar: string;
    };
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
    users: Record<
      string,
      {
        id: number;
        username: string;
        avatar: string;
      }
    >;
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
  isOpponentBlocked: boolean;
  matchStartBallData: {dx: number; dy: number};
  game: {
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
}

export interface Component {
  render(): HTMLElement | undefined;
  destroy?(): void;
}
