import {
  fetchDiscussion,
  fetchGeneralDiscussion,
  loadMoreMessages,
  sendGeneralMessage,
  sendPrivateMessage,
} from '../../api/chats';
import {getRelativeTime, getTimeElapsed} from '../../utils/string';
import {BaseComponent} from '../../components/BaseComponent';
import {createElement} from '../../utils/dom';
import {loadIcons} from '../../utils/icons';
import {renderUserContextMenu} from './userContextMenu';

export class Discussion extends BaseComponent {
  private lastMessageSentIndex?: number;

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
      className: `peer my-1 mx-6 px-4 py-2 rounded-md ${isReceived ? 'border border-pink-300 rounded-bl-none' : 'bg-pink-300 rounded-br-none text-background'} duration-100 leading-tight overflow-x-auto`,
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

    const messageContainer = createElement('div', {
      className: `flex items-end gap-2 ${isReceived ? (message.mention ? 'pl-5' : 'pl-6') : 'pr-6'} ${message.mention ? 'py-2 border-l-4 pl-2 border-pink-300' : 'py-1'}`,
    });
    messageContainer.oncontextmenu = evt => {
      evt.preventDefault();
      renderUserContextMenu(
        sender,
        [isSenderFriend() ? 'unfriend' : 'friend', 'block'],
        [evt.pageX, evt.pageY],
      );
    };

    if (isReceived) {
      const profilePicture = createElement('img', {
        className: 'w-8 h-8 mb-1 rounded-full cursor-pointer',
        attributes: {
          src: sender.avatar,
        },
      });
      profilePicture.onclick = evt =>
        renderUserContextMenu(
          sender,
          [isSenderFriend() ? 'unfriend' : 'friend', 'block'],
          [evt.pageX, evt.pageY],
        );
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
      usernameButton.onclick = evt =>
        renderUserContextMenu(
          sender,
          [isSenderFriend() ? 'unfriend' : 'friend', 'block'],
          [evt.pageX, evt.pageY],
        );
      text.appendChild(usernameButton);
    }

    text.appendChild(
      createElement('p', {
        className: 'break-words hyphens-auto',
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
      className: 'flex flex-col-reverse overflow-y-auto flex-1',
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
      className: 'h-10 mx-6 my-6 flex-none relative flex items-center',
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
          textContent: discussion.user.online
            ? 'Connected'
            : `Offline • ${getRelativeTime(discussion.user.lastSeen)}`,
        }),
      );

      userInfos.appendChild(text);
      leftContent.appendChild(userInfos);
    };

    this.subscribeToPath('discussion.user', renderUserInformations);
    header.appendChild(leftContent);

    const actionButtons = createElement('div', {
      className: 'flex items-center justify-center gap-2',
    });

    const pongButton = createElement('button', {
      className: `w-10 h-10 flex items-center justify-center hover:text-pink-300 hover:bg-pink-300/10 rounded cursor-pointer p-2 duration-100`,
    });
    pongButton.appendChild(
      createElement('i', {
        icon: 'pingpong',
      }),
    );
    actionButtons.appendChild(pongButton);

    const cogButton = createElement('button', {
      className: `w-10 h-10 flex items-center justify-center hover:text-pink-300 hover:bg-pink-300/10 rounded cursor-pointer p-1 duration-100`,
    });
    cogButton.onclick = evt => {
      const {discussion} = this.store.getState();
      if (!discussion) return;

      renderUserContextMenu(
        discussion?.user,
        ['unfriend', 'invite', 'block'],
        [evt.pageX - 100, evt.pageY + 30],
      );
    };

    cogButton.appendChild(
      createElement('i', {
        icon: 'verticalEllipsis',
      }),
    );
    actionButtons.appendChild(cogButton);

    header.appendChild(actionButtons);

    return header;
  }

  private renderPrivateDiscussion(userID: number) {
    fetchDiscussion(userID);

    const container = createElement('div', {
      className: 'flex flex-col h-full',
    });
    container.appendChild(this.renderPrivateDiscussionHeader());

    const messagesList = createElement('div', {
      className: 'flex flex-col-reverse gap-2 overflow-y-auto flex-1 pt-6',
    });

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
      className: 'flex flex-col h-full',
    });
    container.appendChild(this.renderGeneralDiscussionHeader());

    const messagesList = createElement('div', {
      className: 'flex flex-col-reverse overflow-y-auto flex-1 pt-6',
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

    let view: HTMLDivElement;
    const renderDiscussion = () => {
      const {chatView} = this.store.getState();
      if (view) view.innerHTML = '';

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
