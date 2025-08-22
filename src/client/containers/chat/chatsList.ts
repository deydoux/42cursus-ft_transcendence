import {getTimeElapsed, truncateString} from '../../utils/string';
import {DOMUtils} from '../../utils/dom';
import {Store} from '../../services/store';
import {Toastify} from '../../utils/toastify';
import {api} from '../../utils/Api';
import {loadIcons} from '../../utils/icons';

export class ChatsList {
  constructor(private store: Store) {}

  private async fetchChats() {
    try {
      const response = await api.get('chats');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const data = await response.json();
      this.store.setState({
        directChats: data.directs,
        generalChat: data.general,
        countFriendRequests: data.friendRequests,
      });
    } catch (error) {
      Toastify.error('Could not fetch direct chats');
      console.error(error);
    }
  }

  private renderSearchBar() {
    const searchBar = DOMUtils.createElement('div', {
      className: 'px-6 py-4 pt-6 relative flex items-center',
    });
    searchBar.appendChild(
      DOMUtils.createElement('input', {
        className:
          'peer border border-pink-300/50 w-full py-2 px-4 pl-10 rounded-md focus:outline-none focus:border-white placeholder:font-light',
        attributes: {
          placeholder: 'Search user',
          value: this.store.getState().chatsSearchQuery,
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

    return searchBar;
  }

  private renderHeader() {
    const header = DOMUtils.createElement('div', {
      className: 'flex items-center justify-between px-6 py-2',
    });
    header.appendChild(
      DOMUtils.createElement('p', {
        textContent: 'Messages',
        className: 'font-bold text-lg',
      }),
    );
    const friendRequestsButton = DOMUtils.createElement('button', {
      className: 'text-white/50 cursor-pointer hover:text-pink-300',
      textContent: 'Friend requests',
      events: {
        click: () => this.store.setState({chatView: {label: 'friendRequests'}}),
      },
    });
    header.appendChild(friendRequestsButton);

    const renderCountFriendRequests = () => {
      const {countFriendRequests} = this.store.getState();
      if (countFriendRequests > 0)
        friendRequestsButton.textContent = `Friend requests (${countFriendRequests})`;
      else friendRequestsButton.textContent = 'Friend requests';
    };

    renderCountFriendRequests();
    this.store.subscribeToPath(
      'countFriendRequests',
      renderCountFriendRequests,
    );

    return header;
  }

  private renderChats(list: HTMLDivElement) {
    const {directChats, generalChat, chatsSearchQuery} = this.store.getState();
    list.innerHTML = '';

    let filteredChats = [
      ...directChats.map(chat => ({...chat, isGeneral: false})),
    ];
    if (generalChat) {
      filteredChats.unshift({
        ...generalChat,
        updatedAt: generalChat.createdAt,
        isGeneral: true,
      });
    } else {
      filteredChats.unshift({
        isGeneral: true,
        content: '',
        updatedAt: '',
        user: {
          id: 0,
          username: '',
          avatar: '',
        },
      });
    }

    filteredChats = filteredChats.filter(
      chat =>
        chat &&
        (chatsSearchQuery === '' ||
          (chatsSearchQuery && chat.user.username.includes(chatsSearchQuery))),
    );

    if (filteredChats.length === 0) {
      list.appendChild(
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
        events: {
          click: () =>
            this.store.setState({
              chatView: chat.isGeneral
                ? {label: 'general'}
                : {label: chat.user.username, id: chat.user.id},
            }),
        },
      });
      const leftContent = DOMUtils.createElement('div', {
        className: 'flex items-center justify-start gap-4',
      });

      let icon: HTMLElement;
      if (chat.isGeneral) {
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
            src: chat.user.avatar,
          },
        });
      }
      leftContent.appendChild(icon);

      const text = DOMUtils.createElement('div');
      text.appendChild(
        DOMUtils.createElement('p', {
          className: chat.unread ? 'font-bold' : '',
          textContent: chat.isGeneral ? 'General' : chat.user.username,
        }),
      );

      const prefix = chat.isGeneral ? chat.user.username + ': ' : '';
      const content = truncateString(chat.content, 35);
      const timeDelta = getTimeElapsed(chat.updatedAt);
      text.appendChild(
        DOMUtils.createElement('p', {
          className: `text-sm text-nowrap overflow-x-hidden ${chat.content ? (chat.unread ? 'text-white font-bold' : 'text-white/60') : 'text-white/40 italic'}`,
          textContent: chat.content
            ? `${prefix}${content} • ${timeDelta}`
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

      list.appendChild(line);
      loadIcons();
    });
  }

  render() {
    this.fetchChats();
    const container = DOMUtils.createElement('div');

    container.appendChild(this.renderSearchBar());
    container.appendChild(this.renderHeader());

    const list = DOMUtils.createElement('div');
    this.renderChats(list);

    this.store.subscribeToPath('generalChat', () => this.renderChats(list));
    this.store.subscribeToPath('directChats', () => this.renderChats(list));
    this.store.subscribeToPath('chatsSearchQuery', () =>
      this.renderChats(list),
    );

    container.appendChild(list);
    return container;
  }
}
