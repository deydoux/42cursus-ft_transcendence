import {fetchChats, fetchDiscussion} from '../../api/chats';
import {getTimeElapsed, truncateString} from '../../utils/string';
import {BaseComponent} from '../../components/BaseComponent';
import {Toastify} from '../../utils/toastify';
import {createElement} from '../../utils/dom';
import {loadIcons} from '../../utils/icons';
import {renderUserContextMenu} from './userContextMenu';
import {sendFriendRequest} from '../../api/relationships';

export class ChatsList extends BaseComponent {
  private renderSearchBar() {
    const searchBar = createElement('div', {
      className: 'px-6 py-4 pt-6 relative flex items-center',
    });
    searchBar.appendChild(
      createElement('input', {
        className: `peer border border-pink-300/50 w-full py-2 px-4 pl-10 rounded-md focus:outline-none focus:border-white placeholder:font-light`,
        attributes: {
          placeholder: 'Find or add users...',
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
      createElement('i', {
        className: 'absolute left-8 h-5 text-pink-300/50 peer-focus:text-white',
        icon: 'loop',
      }),
    );

    return searchBar;
  }

  private renderHeader() {
    const header = createElement('div', {
      className: 'flex items-center justify-between px-6 py-2',
    });
    header.appendChild(
      createElement('p', {
        textContent: 'Messages',
        className: 'font-bold text-lg',
      }),
    );
    const friendRequestsButton = createElement('button', {
      className: 'text-white/50 cursor-pointer hover:text-pink-300',
      textContent: 'Friend requests',
      onclick: () => this.store.setState({chatView: {label: 'friendRequests'}}),
    });
    header.appendChild(friendRequestsButton);

    const renderCountFriendRequests = () => {
      const {countFriendRequests} = this.store.getState();
      if (countFriendRequests > 0)
        friendRequestsButton.textContent = `Friend requests (${countFriendRequests})`;
      else friendRequestsButton.textContent = 'Friend requests';
    };

    renderCountFriendRequests();
    this.subscribeToPath('countFriendRequests', renderCountFriendRequests);

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
        createElement('p', {
          className: 'text-center mt-6 italic text-white/50',
          textContent: 'No friends with this username',
        }),
      );
      return;
    }

    filteredChats.forEach(chat => {
      const line = createElement('div', {
        className: `h-full flex items-center justify-between gap-4 hover:bg-white/5 py-2 px-6 cursor-pointer`,
      });
      line.onclick = async () => {
        if (chat.isGeneral) {
          this.store.setState({
            chatView: {label: 'general'},
          });
        } else {
          const response = await fetchDiscussion(chat.user.id);
          const {directChats} = this.store.getState();

          if (
            !response.success &&
            response.data === 'Error: You can only view messages with friends'
          ) {
            Toastify.error(
              `You and ${chat.user.username} are no longer friends`,
            );
            this.store.setState({
              directChats: directChats.filter(c => c.user.id !== chat.user.id),
            });

            return;
          }

          this.store.setState({
            chatView: {label: chat.user.username, id: chat.user.id},
            directChats: directChats.map(c =>
              c.user.id === chat.user.id ? {...c, unread: 0} : c,
            ),
          });
        }
      };

      if (!chat.isGeneral) {
        line.oncontextmenu = evt => {
          evt.preventDefault();
          renderUserContextMenu(
            chat.user,
            ['unfriend', 'invite', 'markAsRead', 'block'],
            [evt.pageX, evt.pageY],
          );
        };
      }

      const leftContent = createElement('div', {
        className: 'flex items-center justify-start gap-4 relative',
      });

      let icon: HTMLElement;
      if (chat.isGeneral) {
        icon = createElement('i', {
          className: `w-12 h-12 rounded-full text-pink-300 p-3 border border-pink-300 bg-pink-300/10`,
          icon: 'usersGroup',
        });
      } else {
        icon = createElement('img', {
          className: 'w-12 h-12 rounded-full relative z-5',
          attributes: {
            src: chat.user.avatar,
          },
        });
        if (chat.user.status) {
          leftContent.appendChild(
            createElement('div', {
              className:
                'w-4 h-4 rounded-full bg-emerald-500 border-2 border-background absolute bottom-0 left-9 z-10',
            }),
          );
        }
      }
      leftContent.appendChild(icon);

      const text = createElement('div');
      text.appendChild(
        createElement('p', {
          className: chat.unread ? 'font-bold' : '',
          textContent: chat.isGeneral ? 'General' : chat.user.username,
        }),
      );

      const prefix = chat.isGeneral ? chat.user.username + ': ' : '';
      const content = truncateString(prefix + chat.content || '', 30);
      const timeDelta = getTimeElapsed(chat.updatedAt);
      text.appendChild(
        createElement('p', {
          className: `text-sm text-nowrap overflow-x-hidden ${chat.content ? (chat.unread ? 'text-white font-bold' : 'text-white/60') : 'text-white/40 italic'}`,
          textContent: chat.content
            ? `${content} • ${timeDelta}`
            : 'No messages yet',
        }),
      );

      leftContent.appendChild(text);
      line.appendChild(leftContent);

      const rightContent = createElement('div', {
        className: 'flex items-center justify-center gap-4',
      });
      if (chat.invite) {
        const duelButton = createElement('button', {
          className: `w-10 h-10 flex items-center justify-center enabled:hover:text-pink-300 enabled:hover:bg-pink-300/10 disabled:text-white/20 disabled:cursor-not-allowed rounded cursor-pointer p-2 duration-100`,
        });
        duelButton.onclick = () => {
          this.websocket.send({
            type: 'joinMatchmaking',
            game: chat.invite,
            mode: 'casual',
            targetID: chat.user.id,
          });
          this.store.setState({
            directChats: directChats.map(c =>
              c.user.id === chat.user.id ? {...c, invite: null} : c,
            ),
          });
        };
        duelButton.appendChild(
          createElement('i', {
            icon: chat.invite === 'pong' ? 'pingpong' : 'carWheel',
          }),
        );

        const updateDuelButtonState = () => {
          const {isWaitingForMatchmaking} = this.store.getState();
          duelButton.disabled = isWaitingForMatchmaking;
        };
        updateDuelButtonState();
        this.subscribeToPath('isWaitingForMatchmaking', updateDuelButtonState);

        rightContent.appendChild(duelButton);
      } else if (chat.unread) {
        rightContent.appendChild(
          createElement('div', {
            className: 'w-2 h-2 bg-pink-300 rounded-full',
          }),
        );
      }

      if (chat.invite) {
        const duelButton = createElement('button', {
          className: `w-10 h-10 flex items-center justify-center enabled:hover:text-pink-300 enabled:hover:bg-pink-300/10 disabled:text-white/20 disabled:cursor-not-allowed rounded cursor-pointer p-2 duration-100`,
        });
        duelButton.appendChild(createElement('i', {}));
      }
      line.appendChild(rightContent);

      list.appendChild(line);
      loadIcons();
    });
  }

  renderSendFriendRequestButton(sendRequestContainer: HTMLDivElement) {
    const {chatsSearchQuery} = this.store.getState();
    sendRequestContainer.innerHTML = '';

    if (chatsSearchQuery && chatsSearchQuery.length > 0) {
      const button = createElement('button', {
        className: `mx-auto mt-4 flex text-sm items-center justify-center gap-2 hover:text-pink-300 cursor-pointer rounded-lg px-4 py-2 border hover:bg-pink-300/10 border-pink-300 transition-all`,
        onclick: () => sendFriendRequest(chatsSearchQuery),
      });

      button.appendChild(
        createElement('p', {
          textContent: 'Send friend request',
          attributes: {
            type: 'text',
          },
        }),
      );
      button.appendChild(
        createElement('i', {
          className: 'w-3 h-3 -rotate-30 mb-1',
          icon: 'paperAirplane',
        }),
      );

      sendRequestContainer.appendChild(button);
    }

    loadIcons();
    return sendRequestContainer;
  }

  render() {
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState == 'visible') fetchChatsList();
    });

    const fetchChatsList = () => {
      const {user} = this.store.getState();
      if (user) fetchChats();
    };
    fetchChatsList();
    this.subscribeToPath('user', fetchChatsList);

    const container = createElement('div', {
      className: 'flex flex-col overflow-hidden',
    });

    container.appendChild(this.renderSearchBar());
    container.appendChild(this.renderHeader());

    const list = createElement('div', {
      className: 'flex flex-col flex-1 overflow-y-auto',
    });
    this.renderChats(list);

    this.subscribeToPath('generalChat', () => this.renderChats(list));
    this.subscribeToPath('directChats', () => this.renderChats(list));
    this.subscribeToPath('chatsSearchQuery', () => this.renderChats(list));

    container.appendChild(list);

    const sendRequestContainer = createElement('div');
    container.appendChild(
      this.renderSendFriendRequestButton(sendRequestContainer),
    );
    this.subscribeToPath('chatsSearchQuery', () =>
      this.renderSendFriendRequestButton(sendRequestContainer),
    );

    return container;
  }
}
