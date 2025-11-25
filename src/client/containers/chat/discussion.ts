import {Popup, createPopupContainer} from '../../components/Popup';
import {
  blockUser,
  sendFriendRequest,
  unfriendUser,
} from '../../api/relationships';
import {
  fetchDiscussion,
  fetchGeneralDiscussion,
  loadMoreMessages,
  sendGeneralMessage,
  sendPrivateMessage,
} from '../../api/chats';
import {getRelativeTime, getTimeElapsed} from '../../utils/string';
import {BaseComponent} from '../../components/BaseComponent';
import {Toastify} from '../../utils/toastify';
import {createElement} from '../../utils/dom';
import {fetchUserProfile} from '../../api/users';
import {getAverageRGB} from '../../utils/content';
import {loadIcons} from '../../utils/icons';
import {renderUserContextMenu} from './userContextMenu';
import {user} from '../../types';

export class Discussion extends BaseComponent {
  private lastMessageSentIndex?: number;
  private userProfile: Popup | null = null;

  private renderUserProfile(
    user: user,
    isFriend: boolean,
    position: {x: number; y: number},
    stats: {
      elo: {
        pong: number;
        race: number;
      };
      totalMatches: number;
    },
  ) {
    if (this.userProfile) this.userProfile.destroy();

    const container = createElement('div', {
      className: 'flex flex-col',
    });

    const banner = createElement('div', {
      className: `rounded-t-xl w-full h-12 border border-b-0`,
    });
    const avatarImageElement = createElement('img', {
      attributes: {src: user.avatar},
    });
    const c = getAverageRGB(avatarImageElement);
    banner.style.borderColor = `rgb(${c.r},${c.g},${c.b})`;
    banner.style.background = `linear-gradient(to bottom right, rgb(${c.r} ${c.g} ${c.b} / 0.05), rgb(${c.r} ${c.g} ${c.b} / 0.40))`;

    const actionButtons = createElement('div', {
      className: 'flex items-center justify-end gap-2 px-2 mt-2',
    });

    const renderButton = (icon: string, onclick: () => void) => {
      const btn = createElement('button', {
        className: `rounded-full bg-background/50 text-white p-2 cursor-pointer hover:bg-background duration-100 ${icon === 'noSymbol' ? 'hover:bg-red-500/10 hover:text-red-500' : ''}`,
        onclick: onclick,
      });

      btn.appendChild(
        createElement('i', {
          className: 'w-4 h-4',
          icon: icon,
        }),
      );

      return btn;
    };

    const sendFriendRequestButton = renderButton('userPlus', async () => {
      await sendFriendRequest(user.username);
      if (this.userProfile) this.userProfile.destroy();
    });
    const unfriendButton = renderButton('userMinus', async () => {
      const {directChats} = this.store.getState();
      const relationshipID = directChats.find(
        chat => chat.user.id === user.id,
      )?.relationshipID;
      await unfriendUser(relationshipID ?? 0, user.username);
      if (this.userProfile) this.userProfile.destroy();
    });
    const goToChatButton = renderButton('chatBubbleLeft', async () => {
      if (this.userProfile) this.userProfile.destroy();
      await fetchDiscussion(user.id);
      this.store.setState({
        chatView: {label: user.username, id: user.id},
      });
    });
    const blockButton = renderButton('noSymbol', async () => {
      await blockUser(user.id, user.username);
      if (this.userProfile) this.userProfile.destroy();
    });

    if (isFriend)
      actionButtons.append(unfriendButton, goToChatButton, blockButton);
    else actionButtons.append(sendFriendRequestButton, blockButton);

    banner.appendChild(actionButtons);

    const profileInformations = createElement('div', {
      className: 'border px-4 rounded-b-xl pb-4',
    });

    const avatar = createElement('img', {
      className: 'relative rounded-full object-cover border -mt-7 h-14 w-14',
      attributes: {
        src: user.avatar,
      },
    });
    profileInformations.appendChild(avatar);

    const {directChats} = this.store.getState();
    if (directChats.find(c => c.user.id === user.id)?.user.status) {
      profileInformations.appendChild(
        createElement('div', {
          className: `absolute top-15 left-15 w-4 h-4 rounded-full bg-emerald-500 border-2 border-background`,
        }),
      );
    }

    profileInformations.appendChild(
      createElement('p', {
        className: 'font-bold mt-2',
        textContent: user.username,
      }),
    );

    profileInformations.append(
      createElement('p', {
        className: 'text-xs text-white/50',
        textContent: `${stats.totalMatches} matches played`,
      }),
    );
    profileInformations.append(
      createElement('p', {
        className: 'text-xs text-white/50',
        textContent: `Pong elo: ${stats.elo.pong} • Race elo: ${stats.elo.race}`,
      }),
    );

    const messageInput = createElement('form', {
      className: 'flex items-center w-full relative mt-4',
    });
    messageInput.onsubmit = async evt => {
      evt.preventDefault();
      evt.stopPropagation();

      const formData = new FormData(evt.target as HTMLFormElement);
      const message = formData.get('message')?.toString() ?? '';

      await sendPrivateMessage(user.id, message);
      Toastify.success('Message sent');
      if (this.userProfile) this.userProfile.destroy();
    };

    const input = createElement('input', {
      className: `peer border border-white/50 pr-10 rounded-md text-sm px-3 py-2 outline-none w-full focus:border-white`,
      attributes: {
        placeholder: `Chat with ${user.username}...`,
        name: 'message',
      },
    });
    messageInput.append(input);
    messageInput.append(
      createElement('i', {
        className: `w-4 h-4 absolute -mt-1 right-3 -rotate-35 text-white/50 peer-focus:text-white cursor-pointer`,
        icon: 'paperAirplane',
        attributes: {
          type: 'submit',
        },
      }),
    );

    const friendRequestButton = createElement('button', {
      className: `mt-4 rounded-md w-full py-2 text-sm border border-white/50 hover:border-white hover:bg-white/10 cursor-pointer`,
      textContent: 'Send friend request',
      onclick: async () => {
        await sendFriendRequest(user.username);
        if (this.userProfile) this.userProfile.destroy();
      },
    });

    profileInformations.appendChild(
      isFriend ? messageInput : friendRequestButton,
    );

    container.appendChild(banner);
    container.appendChild(profileInformations);

    this.userProfile = createPopupContainer({
      x: position.x + 20,
      y: position.y - 50,
      className: `absolute z-50 min-w-60 bg-background rounded-xl shadow-xl shadow-white/5`,
      content: container,
      onClose: () => (this.userProfile = null),
    });

    this.userProfile.show();
    input?.focus();
    loadIcons();
  }

  private renderNoChatPlaceholder(username?: string) {
    const noChat = createElement('div', {
      className: `flex flex-1 flex-col justify-center items-center text-center text-white/30`,
    });
    noChat.appendChild(
      createElement('i', {
        className: 'w-30 h-30',
        icon: 'chats',
      }),
    );
    noChat.appendChild(
      createElement('p', {
        className: 'max-w-70 font-light mt-4',
        textContent: username
          ? `Send a first message to start the discussion with ${username}`
          : 'Send a first message to start the discussion in the general chat',
      }),
    );

    return noChat;
  }

  private renderPrivateMessage(
    message: {senderID: number; content: string; createdAt: string},
    isReceived: boolean,
  ) {
    const messageWrapper = createElement('div', {
      className: 'flex group items-center gap-4',
    });

    const messageContainer = createElement('div', {
      className: `break-all peer my-1 mx-6 px-4 py-2 rounded-md ${isReceived ? 'border border-pink-300 rounded-bl-none' : 'bg-pink-300 rounded-br-none text-background'} duration-100 leading-tight overflow-x-auto`,
      textContent: message.content,
    });
    const blankSpace = createElement('div', {
      className: `flex-1 min-w-12 opacity-0 group-hover:opacity-100 text-sm text-white/50 ${isReceived ? 'text-left' : 'text-right'}`,
      textContent: getTimeElapsed(message.createdAt),
    });

    if (isReceived) {
      messageWrapper.appendChild(messageContainer);
      messageWrapper.appendChild(blankSpace);
    } else {
      messageWrapper.appendChild(blankSpace);
      messageWrapper.appendChild(messageContainer);
    }

    return messageWrapper;
  }

  private renderGeneralMessage(
    message: {content: string; createdAt: string; mention: boolean},
    sender: {username: string; avatar: string; id: number},
    isReceived: boolean,
  ) {
    const messageWrapper = createElement('div', {
      className: `flex group items-center gap-4 ${message.mention ? 'bg-pink-300/10' : ''}`,
    });

    const isSenderFriend = () => {
      const {directChats} = this.store.getState();
      return directChats.find(chat => sender.id === chat.user.id);
    };

    const renderUserProfileOnClick = async evt => {
      evt.preventDefault();
      const stats = await fetchUserProfile(sender.id);
      if (!stats) return;

      this.renderUserProfile(
        sender,
        isSenderFriend() ? true : false,
        {
          x: evt.pageX,
          y: evt.pageY,
        },
        stats,
      );
    };

    const messageContainer = createElement('div', {
      className: `flex items-end gap-2 ${isReceived ? (message.mention ? 'pl-5' : 'pl-6') : 'pr-6'} ${message.mention ? 'py-2 border-l-4 pl-2 border-pink-300' : 'py-1'}`,
    });
    messageContainer.oncontextmenu = renderUserProfileOnClick;

    if (isReceived) {
      const profilePicture = createElement('img', {
        className: 'w-8 h-8 mb-1 rounded-full cursor-pointer',
        attributes: {
          src: sender.avatar,
        },
      });
      profilePicture.onclick = renderUserProfileOnClick;
      messageContainer.appendChild(profilePicture);
    }

    const text = createElement('div', {
      className: `peer rounded-md ${isReceived ? 'px-3 py-[5px] border border-pink-300 bg-background rounded-bl-none' : 'px-4 py-2 bg-pink-300 rounded-br-none text-background'} duration-100 leading-tight overflow-x-auto`,
    });
    if (isReceived) {
      const usernameButton = createElement('button', {
        className: `text-pink-300/50 text-sm cursor-pointer hover:underline hover:text-pink-300`,
        textContent: sender.username,
      });
      usernameButton.onclick = renderUserProfileOnClick;
      text.appendChild(usernameButton);
    }

    text.appendChild(
      createElement('p', {
        className: 'break-all hyphens-auto',
        textContent: message.content,
      }),
    );
    messageContainer.appendChild(text);

    const blankSpace = createElement('div', {
      className: `flex-1 min-w-20 opacity-0 group-hover:opacity-100 text-sm text-white/50 ${isReceived ? 'text-left' : 'text-right'}`,
      textContent: getTimeElapsed(message.createdAt),
    });

    if (isReceived) {
      messageWrapper.appendChild(messageContainer);
      messageWrapper.appendChild(blankSpace);
    } else {
      messageWrapper.appendChild(blankSpace);
      messageWrapper.appendChild(messageContainer);
    }

    return messageWrapper;
  }

  private renderMessages(
    container: HTMLDivElement,
    type: 'discussion' | 'generalDiscussion',
  ) {
    const state = this.store.getState();
    const user = state.user;

    const senders = state.generalDiscussion?.users ?? [];
    const messages = state[type]?.messages;
    const next = state[type]?.next;
    if (!messages) return;

    container.innerHTML = '';

    const list = createElement('div', {
      className: `flex flex-col-reverse overflow-y-auto overflow-x-hidden flex-1`,
    });

    let isAtTop = false;
    list.addEventListener('scroll', async () => {
      const atTop = list.clientHeight - list.scrollTop >= list.scrollHeight;

      if (atTop && !isAtTop && next) {
        this.lastMessageSentIndex = messages.length - 1;
        await loadMoreMessages(next);
        isAtTop = true;
      } else if (!atTop) {
        isAtTop = false;
      }
    });

    if (messages.length === 0) {
      list.appendChild(this.renderNoChatPlaceholder());
      loadIcons();
      return;
    }

    messages.forEach(message => {
      const received =
        message.senderID !== user?.id && message.userID !== user?.id;
      list.appendChild(
        type === 'discussion'
          ? this.renderPrivateMessage(message, received)
          : this.renderGeneralMessage(
              message,
              senders[message.userID],
              received,
            ),
      );
    });

    container.appendChild(list);

    if (this.lastMessageSentIndex) {
      list.children[this.lastMessageSentIndex].scrollIntoView({
        block: 'nearest',
        inline: 'start',
      });
      this.lastMessageSentIndex = undefined;
    }
  }

  private renderMessageInput(
    messagesList: HTMLDivElement,
    onSubmit: (message: string) => Promise<void>,
  ) {
    const input = createElement('input', {
      className: `chat-input border border-pink-300 h-full w-full focus:outline-none focus:border-white rounded-lg px-3 pr-10 bg-pink-300/10 placeholder:text-pink-300/50`,
      attributes: {
        name: 'message',
        maxLength: '1024',
        placeholder: 'Message...',
        autocomplete: 'off',
      },
    });

    const messageInput = createElement('form', {
      className:
        'search-input h-10 m-4 xl:m-6 flex-none relative flex items-center',
    });
    messageInput.onsubmit = async evt => {
      evt.preventDefault();

      const formData = new FormData(evt.target as HTMLFormElement);
      const message = formData.get('message')?.toString() ?? '';

      await onSubmit(message);
      input.value = '';
      messagesList.children[0].scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    };

    messageInput.appendChild(input);
    const sendButton = createElement('button', {
      className: `h-5 w-5 cursor-pointer absolute right-2 -rotate-40 text-pink-300 mb-1 animate-wiggle`,
      attributes: {
        type: 'submit',
      },
    });
    sendButton.appendChild(
      createElement('i', {
        className: 'h-5 w-5',
        icon: 'paperAirplane',
      }),
    );

    return messageInput;
  }

  private renderPrivateDiscussionHeader() {
    const container = createElement('div', {
      className: 'flex flex-col w-full flex-none',
    });
    const header = createElement('div', {
      className: `flex items-center justify-between px-6 py-4 border-b border-pink-300/50 flex-none`,
    });
    const leftContent = createElement('div', {
      className: 'flex items-center gap-4',
    });

    const backButton = createElement('button', {
      className: 'cursor-pointer group',
      onclick: () => this.store.setState({chatView: {label: 'chatsList'}}),
    });
    backButton.appendChild(
      createElement('i', {
        className: 'w-5 group-hover:text-pink-300',
        icon: 'leftArrow',
      }),
    );
    leftContent.appendChild(backButton);

    const userInfos = createElement('div', {
      className: 'flex items-center gap-4',
    });

    const renderUserInformations = () => {
      userInfos.innerHTML = '';
      const {discussion} = this.store.getState();
      if (!discussion) return;

      userInfos.appendChild(
        createElement('img', {
          className: 'h-9 rounded-full',
          attributes: {
            src: discussion.user.avatar,
          },
        }),
      );

      const text = createElement('div');
      text.appendChild(
        createElement('p', {
          className: 'font-bold',
          textContent: discussion.user.username,
        }),
      );
      text.appendChild(
        createElement('p', {
          className: 'text-sm text-white/50',
          textContent: discussion.user.status
            ? 'Connected'
            : `Offline • ${getRelativeTime(discussion.user.lastSeen)}`,
        }),
      );

      userInfos.appendChild(text);
      leftContent.appendChild(userInfos);
    };

    renderUserInformations();
    this.subscribeToPath('discussion.user', renderUserInformations);
    header.appendChild(leftContent);

    const actionButtons = createElement('div', {
      className: 'flex items-center justify-center gap-2',
    });

    const duelButton = createElement('button', {
      className: `w-10 h-10 flex items-center justify-center enabled:hover:text-pink-300 enabled:hover:bg-pink-300/10 disabled:text-white/20 disabled:cursor-not-allowed rounded cursor-pointer p-2 duration-100`,
    });
    duelButton.onclick = () => {
      const {discussion} = this.store.getState();
      if (!discussion) return;

      if (!discussion.invite) {
        const rect = duelButton.getBoundingClientRect();
        renderUserContextMenu(
          discussion.user,
          ['invite'],
          [rect.right - 100, rect.bottom + 10],
        );
      } else {
        this.websocket.send({
          type: 'joinMatchmaking',
          game: discussion.invite,
          mode: 'casual',
          targetID: discussion.user.id,
        });
        this.store.setState({
          discussion: {
            ...discussion,
            invite: null,
          },
        });
      }
    };

    const renderDuelButton = () => {
      const {discussion, isWaitingForMatchmaking} = this.store.getState();
      if (!discussion) return;

      duelButton.disabled = isWaitingForMatchmaking;

      duelButton.innerHTML = '';
      duelButton.appendChild(
        createElement('i', {
          className: discussion.invite ? '' : 'mt-[5px]',
          icon: discussion.invite
            ? discussion.invite === 'pong'
              ? 'pingpong'
              : 'carWheel'
            : 'crossedSwords',
        }),
      );
    };

    renderDuelButton();
    this.subscribeToPath('discussion.invite', renderDuelButton);
    this.subscribeToPath('isWaitingForMatchmaking', renderDuelButton);
    actionButtons.appendChild(duelButton);

    const cogButton = createElement('button', {
      className: `w-10 h-10 flex items-center justify-center hover:text-pink-300 hover:bg-pink-300/10 rounded cursor-pointer p-1 duration-100`,
    });
    cogButton.onclick = () => {
      const {discussion} = this.store.getState();
      if (!discussion) return;

      const rect = cogButton.getBoundingClientRect();
      renderUserContextMenu(
        discussion.user,
        ['unfriend', 'block'],
        [rect.right - 120, rect.bottom + 10],
      );
    };

    cogButton.appendChild(
      createElement('i', {
        icon: 'verticalEllipsis',
      }),
    );
    actionButtons.appendChild(cogButton);

    header.appendChild(actionButtons);

    container.appendChild(header);

    const duelBanner = createElement('div', {
      className: 'bg-pink-300 flex items-center justify-between',
    });
    const renderDuelBanner = () => {
      const {discussion, isWaitingForMatchmaking} = this.store.getState();
      if (!discussion) return;
      duelBanner.innerHTML = '';
      if (!discussion.invite) return;

      const text = createElement('p', {
        className: 'py-2 px-3 text-sm text-background',
      });
      text.innerHTML = `This user invites you to play <span class="font-semibold">${discussion.invite}</span> with them`;
      duelBanner.appendChild(text);

      const joinButton = createElement('button', {
        textContent: `Join`,
        className: `text-white bg-background rounded mr-2 py-1 text-xs px-3 cursor-pointer disabled:cursor-not-allowed disabled:bg-background/20 disabled:text-background/50`,
        onclick: () => {
          this.websocket.send({
            type: 'joinMatchmaking',
            game: discussion.invite,
            mode: 'casual',
            targetID: discussion.user.id,
          });
          this.store.setState({
            discussion: {
              ...discussion,
              invite: null,
            },
          });
        },
      });
      joinButton.disabled = isWaitingForMatchmaking;
      duelBanner.appendChild(joinButton);
    };

    renderDuelBanner();
    container.appendChild(duelBanner);
    this.subscribeToPath('discussion.invite', renderDuelBanner);
    this.subscribeToPath('isWaitingForMatchmaking', renderDuelBanner);

    return container;
  }

  private renderPrivateDiscussion(userID: number) {
    const container = createElement('div', {
      className: 'flex flex-col h-full',
    });
    container.appendChild(this.renderPrivateDiscussionHeader());

    const messagesList = createElement('div', {
      className: 'flex flex-col-reverse gap-2 overflow-y-auto flex-1 pt-1',
    });

    this.renderMessages(messagesList, 'discussion');
    this.subscribeToPath('discussion.messages', () => {
      this.renderMessages(messagesList, 'discussion');
    });
    container.appendChild(messagesList);

    container.appendChild(
      this.renderMessageInput(messagesList, message =>
        sendPrivateMessage(userID, message),
      ),
    );

    return container;
  }

  private renderGeneralDiscussionHeader() {
    const header = createElement('div', {
      className: `flex items-center gap-4 px-6 py-4 border-b border-pink-300/50 flex-none`,
    });

    const backButton = createElement('button', {
      className: 'cursor-pointer group',
      onclick: () => this.store.setState({chatView: {label: 'chatsList'}}),
    });
    backButton.appendChild(
      createElement('i', {
        className: 'w-5 group-hover:text-pink-300',
        icon: 'leftArrow',
      }),
    );
    header.appendChild(backButton);

    header.appendChild(
      createElement('i', {
        className: `w-10 h-10 rounded-full text-pink-300 p-2 border border-pink-300 bg-pink-300/10`,
        icon: 'usersGroup',
      }),
    );

    const text = createElement('div');
    text.appendChild(
      createElement('p', {
        className: 'font-bold',
        textContent: 'General chat',
      }),
    );
    text.appendChild(
      createElement('p', {
        className: 'text-sm text-white/50',
        textContent: 'Chat with other pong players online :)',
      }),
    );

    header.appendChild(text);
    return header;
  }

  private renderGeneralDiscussion() {
    fetchGeneralDiscussion();

    const container = createElement('div', {
      className: 'flex flex-col h-full overflow-x-hidden  ',
    });
    container.appendChild(this.renderGeneralDiscussionHeader());

    const messagesList = createElement('div', {
      className:
        'flex flex-col-reverse overflow-y-auto overflow-x-hidden flex-1 pt-1',
    });

    this.subscribeToPath('generalDiscussion.messages', () =>
      this.renderMessages(messagesList, 'generalDiscussion'),
    );
    container.appendChild(messagesList);

    container.appendChild(
      this.renderMessageInput(messagesList, message =>
        sendGeneralMessage(message),
      ),
    );

    return container;
  }

  render() {
    const container = createElement('div', {
      className: 'overflow-hidden flex-1',
    });

    const renderDiscussion = () => {
      const {chatView} = this.store.getState();
      container.innerHTML = '';

      let view: HTMLDivElement;

      if (chatView.label === 'general') view = this.renderGeneralDiscussion();
      else if (chatView.id) view = this.renderPrivateDiscussion(chatView.id);
      else view = createElement('div');

      container.appendChild(view);
    };

    renderDiscussion();
    this.subscribeToPath('chatView', renderDiscussion);
    return container;
  }
}
