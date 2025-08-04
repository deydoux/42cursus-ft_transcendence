import { BaseComponent } from "../components/BaseComponent";
import { Router } from "../services/router";
import { DOMUtils } from "../utils/dom";
import { socket } from "../utils/websocket";

export class Homepage extends BaseComponent {
  constructor(private router: Router) {
    super();

    socket.on('matchStart', (evt) => {
      console.log('match start event triggered!');
    });
  }

  renderMenuButton = (darkMode: boolean = false) => {
    const button = DOMUtils.createElement('div', {
      className: 'flex-1 min-w-1/3',
      events: {
        click: (evt) => {
          socket.send(JSON.stringify({
            type: 'joinMatchmaking',
            game: 'pong',
            mode: 'casual'
          }));
          console.log('trying to join the lobby');
          this.router.navigate('/lobby');
        }
      }
    });
    button.appendChild(DOMUtils.createElement('button', {
      className: `w-full h-full bg-linear-to-br ${darkMode ? 'from-pink-200 to-pink-300 text-background' : 'from-gray-500/20 to-gray-800/20 text-pink-300'} text-background font-bold uppercase rounded-xl`,
      textContent: 'Play pong'
    }));

    return button;
  }

  render(): HTMLElement {
    const container = DOMUtils.createElement('div', {
      className: 'w-screen h-screen flex items-center gap-10 py-16'
    });
    const gameMenu = DOMUtils.createElement('div', {
      className: 'h-full flex-1 flex flex-wrap gap-10'
    });

    gameMenu.appendChild(this.renderMenuButton());
    gameMenu.appendChild(this.renderMenuButton(true));
    gameMenu.appendChild(this.renderMenuButton(true));
    gameMenu.appendChild(this.renderMenuButton());

    const chat = DOMUtils.createElement('div', {
      className: 'w-[400px] h-full flex-none border border-pink-300 rounded-3xl flex flex-col p-6',
    });

    const chatContent = DOMUtils.createElement('div', {
      className: 'flex-1 pb-6'
    });

    const header = DOMUtils.createElement('div', {
      className: 'flex items-end justify-between'
    })
    header.appendChild(DOMUtils.createElement('h2', {
      className: 'text-2xl',
      textContent: 'General chat'
    }));

    const countUsers = DOMUtils.createElement('div', {
      className: 'border border-white rounded-full text-sm py-1 pl-4 px-3 flex gap-1 justify-center items-center'
    });
    countUsers.appendChild(DOMUtils.createElement('p', {
      textContent: '31'
    }));
    countUsers.appendChild(DOMUtils.createElement('i', {
      className: 'w-3 h-3 fill-white',
      attributes: {
        icon: 'user'
      }
    }));

    header.appendChild(countUsers);

    chatContent.appendChild(header);

    const messageInput = DOMUtils.createElement('div', {
      className: 'h-10 relative flex items-center'
    });
    messageInput.appendChild(DOMUtils.createElement('input', {
      className: 'border border-pink-300 h-full w-full focus:outline-none focus:border-white rounded-lg px-3 pr-10 bg-pink-300/10'
    }));
    messageInput.appendChild(DOMUtils.createElement('i', {
      className: 'h-5 w-5 cursor-pointer absolute right-2 -rotate-40 text-pink-300 mb-1 animate-wiggle',
      attributes: {
        icon: 'paperAirplane'
      }
    }))

    chat.appendChild(chatContent);
    chat.appendChild(messageInput);

    container.appendChild(gameMenu);
    container.appendChild(chat);
    return container;
  }
}
