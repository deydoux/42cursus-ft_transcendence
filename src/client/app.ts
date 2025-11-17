import {Api} from './utils/Api';
import {Chat} from './containers/chat/Chat';
import {Homepage} from './pages/Homepage';
import {LandingPage} from './pages/LandingPage';
import {Lobby} from './pages/Lobby';
import {PageNotFound} from './pages/PageNotFound';
import {PongGame} from './pages/PongGame';
import {RaceGame} from './pages/RaceGame';
import {Router} from './services/router';
import {Settings} from './pages/Settings';
import {Socket} from './services/websocket';
import {Statistics} from './pages/Statistics';
import {Store} from './services/store';
import {Tournament} from './pages/Tournament';
import {fetchAccount} from './api/account';
import {loadIcons} from './utils/icons';

class App {
  private websocket: Socket;
  private router: Router;
  private store: Store;

  constructor() {
    this.initializeApp();
  }

  private async initializeApp(): Promise<void> {
    const rootContainer = document.getElementById('root');
    if (!rootContainer) {
      throw new Error('Root container not found');
    }

    this.store = Store.getInstance();

    // Initialize router
    this.router = Router.getInstance(rootContainer);
    this.router.setAuthenticationGuard(async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) return false;

      const {user} = this.store.getState();
      if (user?.id) return true;

      return await fetchAccount();
    });

    this.setupRoutes();
    this.router.initialize();

    this.websocket = Socket.getInstance();
    this.websocket.connect();

    loadIcons();
  }

  private setupRoutes(): void {
    const chat = new Chat().render();

    this.router.addPublicRoute('/', () => new LandingPage());
    this.router.addPublicRoute('*', () => new PageNotFound());

    this.router.addPrivateRoute('/homepage', () => new Homepage(chat));
    this.router.addPrivateRoute('/settings', () => new Settings(chat));
    this.router.addPrivateRoute('/lobby', () => new Lobby(chat));
    this.router.addPrivateRoute(
      '/pong',
      this.protectedGameRoute('pong', () => new PongGame(), chat),
    );
    this.router.addPrivateRoute(
      '/race',
      this.protectedGameRoute('race', () => new RaceGame(), chat),
    );
    this.router.addPrivateRoute('/statistics', () => new Statistics(chat));
    this.router.addPrivateRoute('/tournament', () => new Tournament(chat));
  }

  private protectedGameRoute(
    gameName: string,
    gameFactory: () => PongGame | RaceGame,
    chat: HTMLElement,
  ) {
    return () => {
      const router = Router.getInstance();
      const validAccess = sessionStorage.getItem('validGameAccess');

      if (!validAccess) {
        console.error(
          `Invalid ${gameName} game access (no valid navigation flag), redirecting to homepage`,
        );

        setTimeout(() => {
          router.navigate('/homepage');
        }, 0);

        return new Homepage(chat);
      }

      // Clear the flag after successful access
      sessionStorage.removeItem('validGameAccess');

      return gameFactory();
    };
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  new App();
});

export default App;
