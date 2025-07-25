import { LandingPage } from "./containers/LandingPage";
import { PageNotFound } from "./containers/PageNotFound";
import { Router } from "./services/router";
import { loadIcons } from "./utils/icons";
import './hotReload';

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
    
    loadIcons();
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