import {AppState} from '../types';

export class Store {
  private static instance: Store;
  private listeners: ((state: AppState) => void)[] = [];
  private state: AppState = {
    currentRoute: '/',
    isWaitingForMatchmaking: false,
  };

  static getInstance(): Store {
    if (!Store.instance) {
      Store.instance = new Store();
    }
    return Store.instance;
  }

  getState(): AppState {
    return {...this.state};
  }

  setState(updates: Partial<AppState>): void {
    this.state = {...this.state, ...updates};
    this.notifyListeners();
  }

  subscribe(listener: (state: AppState) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }
}
