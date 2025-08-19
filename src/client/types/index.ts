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
  };

  chatView: string;
  chats: {
    relationshipID: number;
    username: string;
    avatar: string;
    online: boolean;
    lastSeen: string;
    updatedAt: string;
    content: string | undefined;
    unread: number;
  }[];
  chatsSearchQuery: string;

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
}

export interface Component {
  render(): HTMLElement | undefined;
  destroy?(): void;
}
