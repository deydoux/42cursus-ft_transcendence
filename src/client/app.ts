import {Homepage} from './containers/Homepage';
import {LandingPage} from './containers/LandingPage';
import {Lobby} from './containers/Lobby';
import {PageNotFound} from './containers/PageNotFound';
import {PongGame} from './pages/PongGame';
import {RacecarGame} from './pages/RacecarGame';
import {Router} from './services/router';
import {Settings} from './pages/Settings';
import {Statistics} from './pages/Statistics';
import {Store} from './services/store';
import {api} from './utils/Api';
import {loadIcons} from './utils/icons';
import {socket} from './utils/websocket';

class App {
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

      try {
        const response = await api.get('account', {
          headers: {Authorization: `Bearer ${token}`},
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message);
        }

        const data = await response.json();
        this.store.setState({user: data});
        return true;
      } catch (error) {
        console.error(error);
        return false;
      }
    });

    this.setupRoutes();
    this.router.initialize();

    // Initialize websocket if connected
    socket.connect();

    loadIcons();
  }

  private setupRoutes(): void {
    this.router.addPublicRoute('/', () => new LandingPage());
    this.router.addPublicRoute('*', () => new PageNotFound(this.router));

    this.router.addPrivateRoute('/homepage', () => new Homepage());
    this.router.addPrivateRoute('/settings', () => new Settings());
    this.router.addPrivateRoute('/lobby', () => new Lobby());
    this.router.addPrivateRoute('/pong', () => new PongGame());
    this.router.addPrivateRoute('/racecar', () => new RacecarGame());
    this.router.addPrivateRoute('/statistics', () => new Statistics());
  }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
  new App();
});

export default App;
