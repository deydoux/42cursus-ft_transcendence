import {AppState, Component} from '../types';
import {Store} from '../services/store';

export abstract class BaseComponent implements Component {
  protected store = Store.getInstance();
  protected unsubscribe?: () => void;

  constructor() {
    this.unsubscribe = this.store.subscribe(state => this.onStateChange(state));
  }

  abstract render(): HTMLElement;

  protected onStateChange(state: AppState): void {}

  destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}
