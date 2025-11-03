import {BaseComponent} from '../components/BaseComponent';
import {Toastify} from '../utils/toastify';
import {createElement} from '../utils/dom';

export class Lobby extends BaseComponent {
  handleNavigation: () => void;
  currentPath: string;

  constructor(private chat: HTMLElement) {
    super();
    this.currentPath = window.location.pathname;

    this.handleNavigation = () => {
      const newPath = window.location.pathname;

      // Only trigger if we were in /lobby and are leaving it
      const playingLocations = ['/pong', '/race'];
      if (
        this.currentPath === '/lobby' &&
        !playingLocations.includes(newPath)
      ) {
        this.websocket.send({
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
    const text = createElement('p', {
      className: 'flex gap-1',
    });
    text.appendChild(
      createElement('span', {
        textContent: 'Opponent',
      }),
    );
    text.appendChild(
      createElement('span', {
        textContent: opponent.username,
        className: 'text-pink-300 font-bold',
      }),
    );
    text.appendChild(
      createElement('span', {
        textContent: 'found!',
      }),
    );

    container.appendChild(text);
  }

  render(): HTMLElement {
    const state = this.store.getState();
    if (!state.isWaitingForMatchmaking) {
      Toastify.error(
        'You need to subscribe to the matchmaking queue before entering the lobby',
      );
      this.router.navigate('/homepage');
      return createElement('div');
    }

    const container = createElement('div', {
      className: 'flex h-full w-full gap-10',
      attributes: {
        id: 'lobby',
      },
    });

    const lobby = createElement('div', {
      className: 'flex flex-1 flex-col gap-4 items-center justify-center',
    });

    lobby.appendChild(
      createElement('p', {
        textContent: 'Looking for other players...',
      }),
    );
    lobby.appendChild(
      createElement('i', {
        className: 'w-20 h-20 text-pink-300 fill-pink-300 animate-spin',
        attributes: {
          icon: 'loadingSpin',
        },
      }),
    );

    container.appendChild(lobby);
    if (this.chat) container.appendChild(this.chat);
    return container;
  }
}
