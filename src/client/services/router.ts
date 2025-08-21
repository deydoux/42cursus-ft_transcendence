import {Component} from '../types';
import {Store} from './store';
import {loadIcons} from '../utils/icons';

export interface RouteConfig {
  componentFactory: () => Component;
  isPrivate: boolean;
}

export class Router {
  private static instance: Router | null = null;
  private routes = new Map<string, RouteConfig>();
  private currentComponent: Component | null = null;
  private container: HTMLElement;
  private navigationCallbacks: (() => void)[] = [];
  private authenticationGuard: (() => Promise<boolean>) | null = null;
  private unauthorizedRedirect = '/';

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

  setAuthenticationGuard(guard: () => Promise<boolean>): void {
    this.authenticationGuard = guard;
  }

  setUnauthorizedRedirect(path: string): void {
    this.unauthorizedRedirect = path;
  }

  addNavigationCallback(callback: () => void): void {
    this.navigationCallbacks.push(callback);
  }

  removeNavigationCallback(callback: () => void): void {
    const index = this.navigationCallbacks.indexOf(callback);
    if (index > -1) {
      this.navigationCallbacks.splice(index, 1);
    }
  }

  addPublicRoute(path: string, componentFactory: () => Component): void {
    this.routes.set(path, {
      componentFactory,
      isPrivate: false,
    });
  }

  addPrivateRoute(path: string, componentFactory: () => Component): void {
    this.routes.set(path, {
      componentFactory,
      isPrivate: true,
    });
  }

  initialize(): void {
    this.handleRouteChange();
  }

  navigate(path: string): void {
    history.pushState(null, '', path);
    this.handleRouteChange();
  }

  private async handleRouteChange(): Promise<void> {
    const path = window.location.pathname;
    let routeConfig = this.routes.get(path);

    if (!routeConfig) {
      routeConfig = this.routes.get('*');
    }

    this.navigationCallbacks.forEach(callback => callback());

    if (!routeConfig) {
      console.warn(
        `No route found for path: ${path} and no wildcard route registered`,
      );
      return;
    }

    if (routeConfig.isPrivate) {
      if (!this.authenticationGuard) {
        console.warn(
          'Private route accessed but no authentication guard is set',
        );
        return;
      }

      try {
        const isAuthenticated = await this.authenticationGuard();
        if (!isAuthenticated) {
          if (path !== this.unauthorizedRedirect) {
            this.navigate(this.unauthorizedRedirect);
          }
          return;
        }
      } catch (error) {
        console.error('Authentication guard failed:', error);
        if (path !== this.unauthorizedRedirect) {
          this.navigate(this.unauthorizedRedirect);
        }
        return;
      }
    }

    if (this.currentComponent?.destroy) {
      this.currentComponent.destroy();
    }

    this.currentComponent = routeConfig.componentFactory();
    this.container.innerHTML = '';
    const child = this.currentComponent.render();
    if (child) this.container.appendChild(child);

    Store.getInstance().setState({currentRoute: path});
    loadIcons();
  }
}
