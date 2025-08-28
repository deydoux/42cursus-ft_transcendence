import {AppState} from '../types';

export class Store {
  private static instance: Store;
  private listeners: ((state: AppState) => void)[] = [];
  private selectiveListeners: Map<
    string,
    ((value: any, previousValue: any) => void)[]
  > = new Map<string, ((value: any, previousValue: any) => void)[]>();
  private state: AppState = {
    totpCode: undefined,
    user: undefined,
    blockedUsers: [],
    sessions: {session: 0, sessions: []},
    currentRoute: '/',
    isWaitingForMatchmaking: false,
    directChats: [],
    chatsSearchQuery: '',
    chatView: {label: 'chatsList'},
    friendRequests: [],
    sentFriendRequests: [],
    countFriendRequests: 0,
  };
  private previousState: AppState = {...this.state};

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  private notifySelectiveListeners(): void {
    this.selectiveListeners.forEach((listeners, path) => {
      const currentValue = this.getValueByPath(this.state, path);
      const previousValue = this.getValueByPath(this.previousState, path);

      if (currentValue !== previousValue) {
        listeners.forEach(listener => listener(currentValue, previousValue));
      }
    });
  }

  private getValueByPath(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  static getInstance(): Store {
    if (!Store.instance) {
      Store.instance = new Store();
    }
    return Store.instance;
  }

  setState(updates: Partial<AppState>): void {
    this.previousState = {...this.state};
    this.state = {...this.state, ...updates};

    this.notifyListeners();
    this.notifySelectiveListeners();
  }

  getState(): AppState {
    return {...this.state};
  }

  subscribe(listener: (state: AppState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  subscribeToPath<T>(
    path: string,
    listener: (value: T, previousValue: T) => void,
  ): () => void {
    if (!this.selectiveListeners.has(path)) {
      this.selectiveListeners.set(path, []);
    }

    const listeners = this.selectiveListeners.get(path);
    if (listeners) listeners.push(listener);

    return () => {
      const listeners = this.selectiveListeners.get(path);
      if (listeners) {
        const index = listeners.indexOf(listener);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    };
  }
}
