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
  blockedUsers: {
    relationshipID: number;
    createdAt: string;
    id: number;
    username: string;
  }[];
}

export interface Component {
  render(): HTMLElement | undefined;
  destroy?(): void;
}
