import { Store } from "../services/store";
import { AppState, Component } from "../types";

export abstract class BaseComponent implements Component {
  protected store = Store.getInstance();
  protected unsubscribe?: () => void;

  constructor() {
    this.unsubscribe = this.store.subscribe(state => this.onStateChange(state));
  }

  abstract render(): HTMLElement;

  protected onStateChange(state: AppState): void { }

  destroy(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
    }
  }
}