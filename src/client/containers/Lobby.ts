import {BaseComponent} from '../components/BaseComponent';
import {DOMUtils} from '../utils/dom';
import {Toastify} from '../utils/toastify';

export class Lobby extends BaseComponent {
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
        'You need to subscrible to the matchmaking queue before entering the lobby',
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
