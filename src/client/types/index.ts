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

  chatView: {
    label: string;
    id?: number;
  };
  chats: {
    relationshipID: number;
    id: number;
    username: string;
    avatar: string;
    online: boolean;
    lastSeen: string;
    updatedAt: string;
    content: string | undefined;
    unread: number;
  }[];
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
