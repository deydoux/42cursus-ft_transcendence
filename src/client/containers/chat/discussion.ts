import {getRelativeTime, getTimeElapsed} from '../../utils/string';
import {DOMUtils} from '../../utils/dom';
import {Store} from '../../services/store';
import {Toastify} from '../../utils/toastify';
import {api} from '../../utils/Api';
import {loadIcons} from '../../utils/icons';

export class Discussion {
  constructor(private store: Store) {}

  private async fetchDiscussion(userID: number) {
    try {
      const response = await api.get(`chats/direct/${userID}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const data = await response.json();
      this.store.setState({discussion: data});
    } catch (error) {
      Toastify.error('An error occured while fetching discussion');
      console.error(error);
    }
  }

  private async sendPrivateMessage(toUserID: number, message: string) {
    try {
      const response = await api.post(`chats/direct/${toUserID}`, {
        content: message,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const {discussion, user} = this.store.getState();
      if (!discussion) return;

      const newMessages = [
        {
          id: (discussion.messages[0]?.id ?? 0) + 1,
          senderID: user?.id ?? 0,
          content: message,
          createdAt: new Date().toISOString(),
        },
        ...discussion.messages,
      ];
      this.store.setState({discussion: {...discussion, messages: newMessages}});
    } catch (error) {
      Toastify.error('An error occured while sending a message');
      console.error(error);
    }
  }

  private async fetchGeneralDiscussion() {
    try {
      const response = await api.get('chats/general');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const data = await response.json();
      this.store.setState({generalDiscussion: data});
    } catch (error) {
      Toastify.error('An error occured while fetching general discussion');
      console.error(error);
    }
  }

  private async sendGeneralMessage(message: string) {
    try {
      const response = await api.post(`chats/general`, {
        content: message,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const {generalDiscussion, user} = this.store.getState();
      if (!generalDiscussion || !user)
        throw new Error('generalDiscussion or user undefined');

      const newMessages = [
        {
          id: (generalDiscussion.messages[0]?.id ?? 0) + 1,
          userID: user.id,
          content: message,
          createdAt: new Date().toISOString(),
        },
        ...generalDiscussion.messages,
      ];
      this.store.setState({
        generalDiscussion: {...generalDiscussion, messages: newMessages},
      });
    } catch (error) {
      Toastify.error('An error occured while sending a message');
      console.error(error);
    }
  }

  private renderNoChatPlaceholder(username?: string) {
    const noChat = DOMUtils.createElement('div', {
      className:
        'flex flex-1 flex-col justify-center items-center text-center text-white/30',
    });
    noChat.appendChild(
      DOMUtils.createElement('i', {
        className: 'w-30 h-30',
        attributes: {
          icon: 'chats',
        },
      }),
    );
    noChat.appendChild(
      DOMUtils.createElement('p', {
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
    const messageWrapper = DOMUtils.createElement('div', {
      className: 'flex group items-center gap-4',
    });

    const messageContainer = DOMUtils.createElement('div', {
      className: `peer px-4 py-2 rounded-md ${isReceived ? 'border border-pink-300 rounded-tl-none' : 'bg-pink-300 rounded-tr-none text-background'} duration-100 leading-tight overflow-x-auto`,
      textContent: message.content,
    });
    const blankSpace = DOMUtils.createElement('div', {
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
    message: {content: string; createdAt: string},
    sender: {username: string; avatar: string},
    isReceived: boolean,
  ) {
    const messageWrapper = DOMUtils.createElement('div', {
      className: 'flex group items-center gap-4',
    });

    const messageContainer = DOMUtils.createElement('div', {
      className: 'flex items-center gap-2',
    });
    if (isReceived) {
      messageContainer.appendChild(
        DOMUtils.createElement('img', {
          className: 'w-8 h-8 rounded-full',
          attributes: {
            src: sender.avatar,
          },
        }),
      );
    }

    const text = DOMUtils.createElement('div', {
      className: `peer rounded-md ${isReceived ? 'px-3 py-[5px] border border-pink-300 rounded-tl-none' : 'px-4 py-2 bg-pink-300 rounded-tr-none text-background'} duration-100 leading-tight overflow-x-auto`,
    });
    if (isReceived) {
      text.appendChild(
        DOMUtils.createElement('p', {
          className: 'text-pink-300/50 text-sm',
          textContent: sender.username,
        }),
      );
    }
    text.appendChild(
      DOMUtils.createElement('p', {
        className: 'break-words hyphens-auto',
        textContent: message.content,
      }),
    );
    messageContainer.appendChild(text);

    const blankSpace = DOMUtils.createElement('div', {
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

  private renderMessages(
    list: HTMLDivElement,
    type: 'discussion' | 'generalDiscussion',
  ) {
    const state = this.store.getState();
    const user = state.user;

    const senders = state.generalDiscussion?.users ?? [];
    const messages = state[type]?.messages;
    if (!messages) return;

    list.innerHTML = '';

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
  }

  private renderMessageInput(
    messagesList: HTMLDivElement,
    onSubmit: (message: string) => Promise<void>,
  ) {
    const input = DOMUtils.createElement('input', {
      className:
        'border border-pink-300 h-full w-full focus:outline-none focus:border-white rounded-lg px-3 pr-10 bg-pink-300/10 placeholder:text-pink-300/50',
      attributes: {
        name: 'message',
        maxLength: '1024',
        placeholder: 'Message...',
      },
    });

    const messageInput = DOMUtils.createElement('form', {
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
    const sendButton = DOMUtils.createElement('button', {
      className:
        'h-5 w-5 cursor-pointer absolute right-2 -rotate-40 text-pink-300 mb-1 animate-wiggle',
      attributes: {
        type: 'submit',
      },
    });
    sendButton.appendChild(
      DOMUtils.createElement('i', {
        className: 'h-5 w-5',
        attributes: {
          icon: 'paperAirplane',
        },
      }),
    );

    return messageInput;
  }

  private renderPrivateDiscussionHeader() {
    const header = DOMUtils.createElement('div', {
      className:
        'flex items-center justify-between px-6 py-4 border-b border-pink-300/50 flex-none',
    });
    const leftContent = DOMUtils.createElement('div', {
      className: 'flex items-center gap-4',
    });

    const backButton = DOMUtils.createElement('button', {
      className: 'cursor-pointer group',
      events: {
        click: () => this.store.setState({chatView: {label: 'chatsList'}}),
      },
    });
    backButton.appendChild(
      DOMUtils.createElement('i', {
        className: 'w-5 group-hover:text-pink-300',
        attributes: {
          icon: 'leftArrow',
        },
      }),
    );
    leftContent.appendChild(backButton);

    const userInfos = DOMUtils.createElement('div', {
      className: 'flex items-center gap-4',
    });

    const renderUserInformations = () => {
      userInfos.innerHTML = '';
      const {discussion} = this.store.getState();
      if (!discussion) return;

      userInfos.appendChild(
        DOMUtils.createElement('img', {
          className: 'h-9 rounded-full',
          attributes: {
            src: discussion.user.avatar,
          },
        }),
      );

      const text = DOMUtils.createElement('div');
      text.appendChild(
        DOMUtils.createElement('p', {
          className: 'font-bold',
          textContent: discussion.user.username,
        }),
      );
      text.appendChild(
        DOMUtils.createElement('p', {
          className: 'text-sm text-white/50',
          textContent: discussion.user.online
            ? 'Connected'
            : `Offline • last seen ${getRelativeTime(discussion.user.lastSeen)}`,
        }),
      );

      userInfos.appendChild(text);
      leftContent.appendChild(userInfos);
    };

    this.store.subscribeToPath('discussion.user', renderUserInformations);
    header.appendChild(leftContent);

    header.appendChild(
      DOMUtils.createElement('i', {
        className:
          'w-10 h-10 hover:text-pink-300 hover:bg-pink-300/10 rounded-full cursor-pointer p-2 duration-100',
        attributes: {
          icon: 'pingpong',
        },
      }),
    );

    return header;
  }

  private renderPrivateDiscussion(userID: number) {
    this.fetchDiscussion(userID);

    const container = DOMUtils.createElement('div', {
      className: 'flex flex-col h-full',
    });
    container.appendChild(this.renderPrivateDiscussionHeader());

    const messagesList = DOMUtils.createElement('div', {
      className: 'flex flex-col-reverse gap-2 overflow-y-auto flex-1 px-6 pt-6',
    });

    this.store.subscribeToPath('discussion.messages', () =>
      this.renderMessages(messagesList, 'discussion'),
    );
    container.appendChild(messagesList);

    container.appendChild(
      this.renderMessageInput(messagesList, message =>
        this.sendPrivateMessage(userID, message),
      ),
    );

    return container;
  }

  private renderGeneralDiscussionHeader() {
    const header = DOMUtils.createElement('div', {
      className:
        'flex items-center gap-4 px-6 py-4 border-b border-pink-300/50 flex-none',
    });

    const backButton = DOMUtils.createElement('button', {
      className: 'cursor-pointer group',
      events: {
        click: () => this.store.setState({chatView: {label: 'chatsList'}}),
      },
    });
    backButton.appendChild(
      DOMUtils.createElement('i', {
        className: 'w-5 group-hover:text-pink-300',
        attributes: {
          icon: 'leftArrow',
        },
      }),
    );
    header.appendChild(backButton);

    header.appendChild(
      DOMUtils.createElement('i', {
        className:
          'w-10 h-10 rounded-full text-pink-300 p-2 border border-pink-300 bg-pink-300/10',
        attributes: {
          icon: 'usersGroup',
        },
      }),
    );

    const text = DOMUtils.createElement('div');
    text.appendChild(
      DOMUtils.createElement('p', {
        className: 'font-bold',
        textContent: 'General chat',
      }),
    );
    text.appendChild(
      DOMUtils.createElement('p', {
        className: 'text-sm text-white/50',
        textContent: 'Chat with other pong players online :)',
      }),
    );

    header.appendChild(text);
    return header;
  }

  private renderGeneralDiscussion() {
    this.fetchGeneralDiscussion();

    const container = DOMUtils.createElement('div', {
      className: 'flex flex-col h-full',
    });
    container.appendChild(this.renderGeneralDiscussionHeader());

    const messagesList = DOMUtils.createElement('div', {
      className: 'flex flex-col-reverse gap-2 overflow-y-auto flex-1 px-6 pt-6',
    });

    this.store.subscribeToPath('generalDiscussion.messages', () =>
      this.renderMessages(messagesList, 'generalDiscussion'),
    );
    container.appendChild(messagesList);

    container.appendChild(
      this.renderMessageInput(messagesList, message =>
        this.sendGeneralMessage(message),
      ),
    );

    return container;
  }

  render() {
    const container = DOMUtils.createElement('div', {
      className: 'overflow-hidden flex-1',
    });

    const renderDiscussion = () => {
      const {chatView} = this.store.getState();
      let view: HTMLDivElement;

      if (chatView.label === 'general') view = this.renderGeneralDiscussion();
      else if (chatView.id) view = this.renderPrivateDiscussion(chatView.id);
      else view = DOMUtils.createElement('div');

      container.appendChild(view);
    };

    renderDiscussion();
    this.store.subscribeToPath('chatView', renderDiscussion);
    return container;
  }
}
