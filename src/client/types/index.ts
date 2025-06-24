export interface AppState {
  currentRoute: string;
}

export interface Component {
  render(): HTMLElement;
  destroy?(): void;
}
