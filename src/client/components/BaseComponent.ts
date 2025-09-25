import {AppState, Component} from '../types';
import {Api} from '../utils/Api';
import {Router} from '../services/router';
import {Store} from '../services/store';

export abstract class BaseComponent implements Component {
  private unsubscribeFunctions: (() => void)[] = [];
  private childComponents: BaseComponent[] = [];

  protected store = Store.getInstance();
  protected api = Api.getInstance();
  protected router = Router.getInstance();

  abstract render(): HTMLElement;

  protected createChild<T extends BaseComponent>(
    ComponentClass: new () => T,
  ): T {
    const component = new ComponentClass();
    this.childComponents.push(component);
    return component;
  }

  protected removeChild<T extends BaseComponent>(ComponentClass: T): void {
    this.childComponents = this.childComponents.filter(
      c => c != ComponentClass,
    );
  }

  protected subscribeToPath<T>(
    path: string,
    listener: (value: T, previousValue: T) => void,
  ): void {
    const unsubscribe = this.store.subscribeToPath(path, listener);
    this.unsubscribeFunctions.push(unsubscribe);
  }

  protected subscribe(listener: (state: AppState) => void): void {
    const unsubscribe = this.store.subscribe(listener);
    this.unsubscribeFunctions.push(unsubscribe);
  }

  destroy(): void {
    // Destroy all child components first
    this.childComponents.forEach(component => component.destroy());
    this.childComponents = [];

    this.unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    this.unsubscribeFunctions = [];
  }
}
