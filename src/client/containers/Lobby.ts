import {BaseComponent} from '../components/BaseComponent';
import {DOMUtils} from '../utils/dom';
import {Toastify} from '../utils/toastify';
import {socket} from '../utils/websocket';

export class Lobby extends BaseComponent {
  handleNavigation: () => void;
  currentPath: string;

  constructor() {
    super();
    this.currentPath = window.location.pathname;

    this.handleNavigation = () => {
      const newPath = window.location.pathname;

      // Only trigger if we were in /lobby and are leaving it
      if (this.currentPath === '/lobby' && newPath !== '/lobby') {
        socket.send({
          type: 'leaveMatchmaking',
        });
      }

      this.currentPath = newPath;
    };
    this.router.addNavigationCallback(this.handleNavigation);
  }

  destroy() {
    this.router.removeNavigationCallback(this.handleNavigation);
  }

  static renderFoundOpponent(opponent: {username: string}) {
    const container = document.querySelector('div#lobby');
    if (!container) return;

    container.innerHTML = '';
    const text = DOMUtils.createElement('p', {
      className: 'flex gap-1',
    });
    text.appendChild(
      DOMUtils.createElement('span', {
        textContent: 'Opponent',
      }),
    );
    text.appendChild(
      DOMUtils.createElement('span', {
        textContent: opponent.username,
        className: 'text-pink-300 font-bold',
      }),
    );
    text.appendChild(
      DOMUtils.createElement('span', {
        textContent: 'found!',
      }),
    );

    container.appendChild(text);
  }

  render() {
    const state = this.store.getState();
    if (!state.isWaitingForMatchmaking) {
      Toastify.error(
        'You need to subscribe to the matchmaking queue before entering the lobby',
      );
      this.router.navigate('/homepage');
      return;
    }

    const container = DOMUtils.createElement('div', {
      className: 'w-screen h-screen flex flex-col items-center justify-center',
      attributes: {
        id: 'lobby',
      },
    });

    container.appendChild(
      DOMUtils.createElement('p', {
        textContent: 'Looking for other players...',
      }),
    );

    container.appendChild(
      DOMUtils.createElement('i', {
        className: 'w-20 h-20 text-pink-300 fill-pink-300 animate-spin',
        attributes: {
          icon: 'loadingSpin',
        },
      }),
    );

    return container;
  }
}
