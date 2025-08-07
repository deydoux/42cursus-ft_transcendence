import {BaseComponent} from '../components/BaseComponent';
import {DOMUtils} from '../utils/dom';

export class Chat extends BaseComponent {
  render(): HTMLElement | undefined {
    const container = DOMUtils.createElement('div', {
      className: 'w-screen h-screen flex items-center gap-10 py-16',
    });

    const chatContent = DOMUtils.createElement('div', {
      className: 'flex-1 pb-6',
    });

    const header = DOMUtils.createElement('div', {
      className: 'flex items-end justify-between',
    });
    header.appendChild(
      DOMUtils.createElement('h2', {
        className: 'text-2xl',
        textContent: 'General chat',
      }),
    );

    const countUsers = DOMUtils.createElement('div', {
      className:
        'border border-white rounded-full text-sm py-1 pl-4 px-3 flex gap-1 justify-center items-center',
    });
    countUsers.appendChild(
      DOMUtils.createElement('p', {
        textContent: '31',
      }),
    );
    countUsers.appendChild(
      DOMUtils.createElement('i', {
        className: 'w-3 h-3 fill-white',
        attributes: {
          icon: 'user',
        },
      }),
    );

    header.appendChild(countUsers);

    chatContent.appendChild(header);

    const messageInput = DOMUtils.createElement('div', {
      className: 'h-10 relative flex items-center',
    });
    messageInput.appendChild(
      DOMUtils.createElement('input', {
        className:
          'border border-pink-300 h-full w-full focus:outline-none focus:border-white rounded-lg px-3 pr-10 bg-pink-300/10',
      }),
    );
    messageInput.appendChild(
      DOMUtils.createElement('i', {
        className:
          'h-5 w-5 cursor-pointer absolute right-2 -rotate-40 text-pink-300 mb-1 animate-wiggle',
        attributes: {
          icon: 'paperAirplane',
        },
      }),
    );

    container.appendChild(chatContent);
    container.appendChild(messageInput);
    return container;
  }
}
