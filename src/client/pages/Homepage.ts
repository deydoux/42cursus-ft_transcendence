import {BaseComponent} from '../components/BaseComponent';
import {createElement} from '../utils/dom';
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
      className: 'h-full flex-1 flex flex-wrap gap-10',
    });

    gameMenu.appendChild(this.renderMenuButton(false));

    gameMenu.appendChild(
      this.renderMenuButton(true, 'Play local', () => {
        this.store.setState({isGameLocal: true});
        this.router.navigate(`/pong`);
      }),
    );

    gameMenu.appendChild(
      this.renderMenuButton(true, 'Play pong', () => {
        this.store.setState({isGameLocal: false});
        socket.send(
          JSON.stringify({
            type: 'joinMatchmaking',
            game: 'pong',
            mode: 'casual',
          }),
        );
      }),
    );

    gameMenu.appendChild(
      this.renderMenuButton(false, 'Settings', () =>
        this.router.navigate(`/settings`),
      ),
    );

    container.appendChild(gameMenu);
    if (this.chat) container.appendChild(this.chat);
    return container;
  }
}
