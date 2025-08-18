import {BaseComponent} from '../components/BaseComponent';
import {DOMUtils} from '../utils/dom';
import {Toastify} from '../utils/toastify';
import {api} from '../utils/Api';
import {getTimeElapsed} from '../utils/string';
import {loadIcons} from '../utils/icons';

export class Chat extends BaseComponent {
  private async fetchChats() {
    // chats/direct
    try {
      const response = await api.get('chats/direct');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const data = await response.json();
      this.store.setState({chats: data});
    } catch (error) {
      Toastify.error('Could not fetch direct chats');
      console.error(error);
    }
  }

  render(): HTMLElement | undefined {
    this.fetchChats();

    const container = DOMUtils.createElement('div', {
      className:
        'w-[400px] h-full flex-none border border-pink-300 rounded-xl flex flex-col',
    });

    const chatContent = DOMUtils.createElement('div', {
      className: 'flex-1',
    });

    const searchBar = DOMUtils.createElement('div', {
      className: 'px-6 py-4 pt-6 relative flex items-center',
    });
    searchBar.appendChild(
      DOMUtils.createElement('input', {
        className:
          'peer border border-pink-300/50 w-full py-2 px-4 pl-10 rounded-md focus:outline-none focus:border-white placeholder:font-light',
        attributes: {
          placeholder: 'Search user',
        },
        events: {
          input: evt => {
            const value = (evt.target as HTMLInputElement).value;
            this.store.setState({chatsSearchQuery: value});
          },
        },
      }),
    );
    searchBar.appendChild(
      DOMUtils.createElement('i', {
        className: 'absolute left-8 h-5 text-pink-300/50 peer-focus:text-white',
        attributes: {
          icon: 'loop',
        },
      }),
    );

    loadIcons();

    chatContent.appendChild(searchBar);

    const header = DOMUtils.createElement('div', {
      className: 'flex items-center justify-between px-6 py-2',
    });
    header.appendChild(
      DOMUtils.createElement('p', {
        textContent: 'Messages',
        className: 'font-bold text-lg',
      }),
    );
    header.appendChild(
      DOMUtils.createElement('button', {
        className: 'text-white/50 cursor-pointer',
        textContent: 'Friend requests',
      }),
    );

    chatContent.appendChild(header);

    const chatsList = DOMUtils.createElement('div');

    const renderChats = () => {
      const {chats, chatsSearchQuery} = this.store.getState();
      chatsList.innerHTML = '';

      const filteredChats = [
        {
          username: 'General',
          relationshipID: 0,
          updatedAt: '',
          online: true,
          lastSeen: '',
          content: '',
          avatar: '',
          unread: 0,
        },
        ...chats,
      ].filter(
        chat =>
          chatsSearchQuery === '' ||
          (chatsSearchQuery && chat.username.includes(chatsSearchQuery)),
      );

      if (filteredChats.length === 0) {
        chatsList.appendChild(
          DOMUtils.createElement('p', {
            className: 'text-center mt-10 italic text-white/50',
            textContent: 'No friends with this username',
          }),
        );
        return;
      }

      filteredChats.forEach(chat => {
        const line = DOMUtils.createElement('div', {
          className:
            'flex items-center justify-between hover:bg-white/5 py-2 px-6 cursor-pointer',
        });
        const leftContent = DOMUtils.createElement('div', {
          className: 'flex items-center justify-start gap-4',
        });

        let icon: HTMLElement;
        if (chat.username === 'General') {
          icon = DOMUtils.createElement('i', {
            className:
              'w-12 h-12 rounded-full text-pink-300 p-3 border border-pink-300 bg-pink-300/10',
            attributes: {
              icon: 'usersGroup',
            },
          });
        } else {
          icon = DOMUtils.createElement('img', {
            className: 'w-12 h-12 rounded-full',
            attributes: {
              src: chat.avatar,
            },
          });
        }
        leftContent.appendChild(icon);

        const text = DOMUtils.createElement('div');
        text.appendChild(
          DOMUtils.createElement('p', {
            className: chat.unread ? 'font-bold' : '',
            textContent: chat.username,
          }),
        );
        text.appendChild(
          DOMUtils.createElement('p', {
            className: `text-sm ${chat.content ? (chat.unread ? 'text-white font-bold' : 'text-white/60') : 'text-white/40 italic'}`,
            textContent: chat.content
              ? `${chat.content} • ${getTimeElapsed(chat.updatedAt)}`
              : 'Aucun message',
          }),
        );

        leftContent.appendChild(text);
        line.appendChild(leftContent);

        const rightContent = DOMUtils.createElement('div');
        if (chat.unread) {
          rightContent.appendChild(
            DOMUtils.createElement('div', {
              className: 'w-2 h-2 bg-pink-300 rounded-full',
            }),
          );
        }
        line.appendChild(rightContent);

        chatsList.appendChild(line);
        loadIcons();
      });
    };

    this.store.subscribeToPath('chats', () => renderChats());
    this.store.subscribeToPath('chatsSearchQuery', () => renderChats());

    chatContent.appendChild(chatsList);
    // const messageInput = DOMUtils.createElement('div', {
    //   className: 'h-10 relative flex items-center',
    // });
    // messageInput.appendChild(
    //   DOMUtils.createElement('input', {
    //     className:
    //       'border border-pink-300 h-full w-full focus:outline-none focus:border-white rounded-lg px-3 pr-10 bg-pink-300/10',
    //   }),
    // );
    // messageInput.appendChild(
    //   DOMUtils.createElement('i', {
    //     className:
    //       'h-5 w-5 cursor-pointer absolute right-2 -rotate-40 text-pink-300 mb-1 animate-wiggle',
    //     attributes: {
    //       icon: 'paperAirplane',
    //     },
    //   }),
    // );

    container.appendChild(chatContent);
    // container.appendChild(messageInput);
    return container;
  }
}
