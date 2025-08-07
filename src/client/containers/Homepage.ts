import {BaseComponent} from '../components/BaseComponent';
import {Chat} from './Chat';
import {DOMUtils} from '../utils/dom';
import {socket} from '../utils/websocket';

export class Homepage extends BaseComponent {
  renderMenuButton = (darkMode = false) => {
    const button = DOMUtils.createElement('div', {
      className: 'flex-1 min-w-1/3',
      events: {
        click: () => {
          socket.send(
            JSON.stringify({
              type: 'joinMatchmaking',
              game: 'pong',
              mode: 'casual',
            }),
          );
        },
      },
    });
    button.appendChild(
      DOMUtils.createElement('button', {
        className: `w-full h-full bg-linear-to-br ${darkMode ? 'from-pink-200 to-pink-300 text-background' : 'from-gray-500/20 to-gray-800/20 text-pink-300'} text-background font-bold uppercase rounded-xl`,
        textContent: 'Play pong',
      }),
    );

    return button;
  };

  render(): HTMLElement {
    const container = DOMUtils.createElement('div', {
      className: 'w-screen h-screen flex items-center gap-10 py-16',
    });
    const gameMenu = DOMUtils.createElement('div', {
      className: 'h-full flex-1 flex flex-wrap gap-10',
    });

    gameMenu.appendChild(this.renderMenuButton());
    gameMenu.appendChild(this.renderMenuButton(true));
    gameMenu.appendChild(this.renderMenuButton(true));
    gameMenu.appendChild(this.renderMenuButton());

    container.appendChild(gameMenu);

    const chat = new Chat().render();
    if (chat) container.appendChild(chat);
    return container;
  }
}
