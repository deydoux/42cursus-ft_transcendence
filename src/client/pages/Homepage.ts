import {BaseComponent} from '../components/BaseComponent';
import {createElement} from '../utils/dom';
import {Toastify} from '../utils/toastify';
import {socket} from '../utils/websocket';

export class Homepage extends BaseComponent {
  constructor(private chat: HTMLElement) {
    super();
  }

  renderMenuButton = (
    darkMode = false,
    label?: string,
    callback?: () => void,
  ) => {
    const button = createElement('div', {
      className: 'flex-1 min-w-1/3',
      onclick: () => {
        if (callback) callback();
      },
    });
    button.appendChild(
      createElement('button', {
        className: `w-full h-full bg-linear-to-br ${darkMode ? 'from-pink-200 to-pink-300 text-background' : 'from-gray-500/20 to-gray-800/20 text-pink-300'} text-background font-bold uppercase rounded-xl`,
        textContent: label ? label : 'Play pong',
      }),
    );

    return button;
  };

  render(): HTMLElement {
    const container = createElement('div', {
      className: 'flex h-full w-full gap-10',
    });

    const gameMenu = createElement('div', {
      className: 'h-full flex-1 grid grid-cols-2 grid-rows-2 gap-10',
    });

    const pongButtons = createElement('div', {
      className: 'flex flex-col gap-2',
    });
    pongButtons.append(
      createElement('button', {
        textContent: 'Play pong online',
        className: `cursor-pointer flex-1 rounded bg-gradient-to-br from-pink-200 to-pink-300 font-semibold uppercase text-background rounded-t-xl`,
        onclick: () => {
          this.store.setState({isPongGameLocal: false});
          socket.send(
            JSON.stringify({
              type: 'joinMatchmaking',
              game: 'pong',
              mode: 'casual',
            }),
          );
        },
      }),
    );
    pongButtons.append(
      createElement('button', {
        textContent: 'Play pong local',
        className: `cursor-pointer flex-1 rounded bg-background rounded-b-xl font-semibold uppercase text-pink-300 border-3 border-pink-300`,
        onclick: () => {
          this.store.setState({isPongGameLocal: true});
          this.router.navigate(`/pong`);
        },
      }),
    );

    const racecarButtons = createElement('div', {
      className: 'flex flex-col gap-2',
    });
    racecarButtons.append(
      createElement('button', {
        textContent: 'Play racecar online',
        className: `cursor-pointer flex-1 rounded bg-gradient-to-br from-pink-200 to-pink-300 font-semibold uppercase text-background rounded-t-xl`,
        onclick: () => {
          this.store.setState({isPongGameLocal: false});
          socket.send(
            JSON.stringify({
              type: 'joinMatchmaking',
              game: 'racecar',
              mode: 'casual',
            }),
          );
        },
      }),
    );
    racecarButtons.append(
      createElement('button', {
        textContent: 'Play racecar local',
        className: `cursor-pointer flex-1 rounded bg-background rounded-b-xl font-semibold uppercase text-pink-300 border-3 border-pink-300`,
        onclick: () => {
          this.store.setState({isPongGameLocal: true});
          this.router.navigate(`/racecar`);
        },
      }),
    );

    gameMenu.appendChild(pongButtons);
    gameMenu.appendChild(racecarButtons);

    const tournamentsButton = createElement('button', {
      textContent: 'Tournaments',
      className: `cursor-pointer flex-1 rounded bg-background rounded-xl font-semibold uppercase text-pink-300 border-3 border-pink-300`,
    });
    tournamentsButton.onclick = () => {
      Toastify.info("Don't know, don't care");
    };
    gameMenu.appendChild(tournamentsButton);
    gameMenu.appendChild(
      createElement('button', {
        textContent: 'Settings',
        className: `cursor-pointer flex-1 rounded bg-gradient-to-br from-pink-200 to-pink-300 rounded-xl font-semibold uppercase text-background`,
        onclick: () => {
          this.router.navigate('/settings');
        },
      }),
    );

    container.appendChild(gameMenu);
    if (this.chat) container.appendChild(this.chat);
    return container;
  }
}
