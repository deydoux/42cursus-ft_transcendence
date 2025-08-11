export interface AppState {
  currentRoute: string;
  isWaitingForMatchmaking: boolean;
  user?: {
    id: number;
    username: string;
    passwordEditedAt: string;
    totp: boolean; // 2FA
    avatar: string;
  };
}

export interface Component {
  render(): HTMLElement | undefined;
  destroy?(): void;
}
