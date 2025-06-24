import { Component } from "../types";
import { Store } from "./store";

export class Router {
  private routes: Map<string, () => Component> = new Map();
  private currentComponent: Component | null = null;
  private container: HTMLElement;

  constructor(container: HTMLElement) {
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

      console.log('currentComponent', this.currentComponent);
      console.log('container', this.container);
      
      // Render new component
      this.currentComponent = componentFactory();
      this.container.innerHTML = '';
      this.container.appendChild(this.currentComponent.render());
      
      // Update store
      Store.getInstance().setState({ currentRoute: path });
    } else {
      console.warn(`No route found for path: ${path} and no wildcard route registered`);
    }
  }
}
