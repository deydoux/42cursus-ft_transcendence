import {Component} from '../types';
import {Store} from './store';
import {loadIcons} from '../utils/icons';

export class Router {
  private static instance: Router | null = null;
  private routes = new Map<string, () => Component>();
  private currentComponent: Component | null = null;
  private container: HTMLElement;

  static getInstance(container?: HTMLElement): Router {
    if (!Router.instance) {
      if (!container) {
        throw new Error('Container required for first Router initialization');
      }
      Router.instance = new Router(container);
    }
    return Router.instance;
  }

  private constructor(container: HTMLElement) {
    this.container = container;
    window.addEventListener('popstate', () => this.handleRouteChange());
  }

  addRoute(path: string, componentFactory: () => Component): void {
    this.routes.set(path, componentFactory);
  }

  initialize(): void {
    this.handleRouteChange();
  }

  navigate(path: string): void {
    history.pushState(null, '', path);
    this.handleRouteChange();
  }

  private handleRouteChange(): void {
    const path = window.location.pathname;
    let componentFactory = this.routes.get(path);

    if (!componentFactory) {
      componentFactory = this.routes.get('*');
    }

    if (componentFactory) {
      // Clean up previous component
      if (this.currentComponent?.destroy) {
        this.currentComponent.destroy();
      }

      // Render new component
      this.currentComponent = componentFactory();
      this.container.innerHTML = '';
      const child = this.currentComponent.render();
      if (child) this.container.appendChild(child);

      // Update store
      Store.getInstance().setState({currentRoute: path});
      loadIcons();
    } else {
      console.warn(
        `No route found for path: ${path} and no wildcard route registered`,
      );
    }
  }
}
