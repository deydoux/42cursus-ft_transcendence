export interface AppState {
  currentRoute: string;

  isWaitingForMatchmaking: boolean;
}

export interface Component {
  render(): HTMLElement | undefined;
  destroy?(): void;
}
