import { LandingPage } from "./containers/LandingPage";
import { PageNotFound } from "./containers/PageNotFound";
import { Router } from "./services/router";
import { DOMUtils } from "./utils/dom";

class App {
  private router: Router;

  constructor() {
    this.initializeApp();
  }

  private initializeApp(): void {
    const rootContainer = document.getElementById('root');
    if (!rootContainer) {
      throw new Error('Root container not found');
    }

    // Initialize router
    this.router = new Router(rootContainer);
    this.setupRoutes();
    this.router.initialize();
  }

  private setupRoutes(): void {
    this.router.addRoute('/', () => new LandingPage(this.router));
    this.router.addRoute('*', () => new PageNotFound(this.router));
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  new App();
});

export default App;