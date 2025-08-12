import {Homepage} from './containers/Homepage';
import {LandingPage} from './containers/LandingPage';
import {Lobby} from './containers/Lobby';
import {PageNotFound} from './containers/PageNotFound';
import {PongGame} from './pages/PongGame';
import {RacecarGame} from './pages/RacecarGame';
import {Router} from './services/router';
import {Settings} from './pages/Settings';
import {Statistics} from './pages/Statistics';
import {loadIcons} from './utils/icons';
import {socket} from './utils/websocket';

class App {
  private router: Router;

  constructor() {
    this.initializeApp();
  }

  private async initializeApp(): Promise<void> {
    const rootContainer = document.getElementById('root');
    if (!rootContainer) {
      throw new Error('Root container not found');
    }

    // Initialize router
    this.router = Router.getInstance(rootContainer);
    this.setupRoutes();
    this.router.initialize();

    // Initialize websocket if connected
    socket.connect();

    loadIcons();
  }

  private setupRoutes(): void {
    this.router.addRoute('/', () => new LandingPage());
    this.router.addRoute('*', () => new PageNotFound(this.router));

    this.router.addRoute('/homepage', () => new Homepage());
    this.router.addRoute('/settings', () => new Settings());
    this.router.addRoute('/lobby', () => new Lobby());
    this.router.addRoute('/pong', () => new PongGame());
    this.router.addRoute('/racecar', () => new RacecarGame());
    this.router.addRoute('/statistics', () => new Statistics());
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  new App();
});

export default App;
