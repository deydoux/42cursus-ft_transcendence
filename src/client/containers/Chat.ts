import {getRelativeTime, getTimeElapsed, truncateString} from '../utils/string';
import {BaseComponent} from '../components/BaseComponent';
import {DOMUtils} from '../utils/dom';
import {Toastify} from '../utils/toastify';
import {api} from '../utils/Api';
import {loadIcons} from '../utils/icons';

export class Chat extends BaseComponent {
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

  private async fetchFriendRequests() {
    try {
      const response = await api.get('relationships/friends/requests/received');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const data = await response.json();
      this.store.setState({friendRequests: data});
    } catch (error) {
      Toastify.error('Could not fetch friend requests');
      console.error(error);
    }
  }

  private async fetchSentFriendRequests() {
    try {
      const response = await api.get('relationships/friends/requests/sent');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const data = await response.json();
      this.store.setState({sentFriendRequests: data});
    } catch (error) {
      Toastify.error('Could not fetch sent friend requests');
      console.error(error);
    }
  }

  private async acceptFriendRequest(
    username: string,
    userID: number,
    relationshipID: number,
  ) {
    try {
      const response = await api.patch(`relationships/${relationshipID}`, {});

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const {friendRequests} = this.store.getState();

      const filteredRequests = friendRequests.filter(request => {
        return request.username !== username;
      });
      this.store.setState({
        friendRequests: filteredRequests,
        chatView: {
          id: userID,
          label: username,
        },
      });
      Toastify.success(`You can now chat with ${username}!`);
    } catch (error) {
      Toastify.error('An error occured while accepting friend request');
      console.error(error);
    }
  }

  private async closeRequest(username: string, relationshipID: number) {
    try {
      const response = await api.delete(`relationships/${relationshipID}`, {});

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const {friendRequests, sentFriendRequests} = this.store.getState();
      this.store.setState({
        friendRequests: friendRequests.filter(
          request => request.username !== username,
        ),
        sentFriendRequests: sentFriendRequests.filter(
          request => request.username !== username,
        ),
      });
      Toastify.success(`Closed request`);
    } catch (error) {
      Toastify.error('An error occured while accepting friend request');
      console.error(error);
    }
  }

  private async fetchDiscussion(username: string, userID?: number) {
    try {
      const isGeneral = username === 'general' && !userID;
      const response = await api.get(
        isGeneral ? 'chats/general' : `chats/direct/${userID}`,
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const data = await response.json();
      if (isGeneral) this.store.setState({generalDiscussion: data});
      else this.store.setState({discussion: data});
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

      const {discussion} = this.store.getState();
      if (!discussion) return;

      const newMessages = [
        {
          id: (discussion.messages[0]?.id ?? 0) + 1,
          senderID: 0,
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

  private async sendGeneralMessage(message: string) {
    try {
      const response = await api.post(`chats/general`, {
        content: message,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const {generalDiscussion} = this.store.getState();
      if (!generalDiscussion) return;

      const newMessages = [
        {
          id: (generalDiscussion.messages[0]?.id ?? 0) + 1,
          userID: generalDiscussion.users[0].id,
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

  static async markMessagesAsRead(userID: number) {
    try {
      const response = await api.patch(`chats/direct/${userID}`, {});

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    } catch (error) {
      Toastify.error('An error occured while smarking messages as read');
      console.error(error);
    }
  }

  private renderChatsList() {
    this.fetchChats();
    const container = DOMUtils.createElement('div');

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

    container.appendChild(searchBar);

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

    container.appendChild(header);

    const list = DOMUtils.createElement('div');

    const renderChats = () => {
      const {directChats, generalChat, chatsSearchQuery} =
        this.store.getState();
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
            (chatsSearchQuery &&
              chat.user.username.includes(chatsSearchQuery))),
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
        text.appendChild(
          DOMUtils.createElement('p', {
            className: `text-sm text-nowrap overflow-x-hidden ${chat.content ? (chat.unread ? 'text-white font-bold' : 'text-white/60') : 'text-white/40 italic'}`,
            textContent: chat.content
              ? `${chat.isGeneral ? chat.user.username + ': ' : ''}${truncateString(chat.content, 35)} • ${getTimeElapsed(chat.updatedAt)}`
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
    };

    this.store.subscribeToPath('generalChat', () => renderChats());
    this.store.subscribeToPath('directChats', () => renderChats());
    this.store.subscribeToPath('chatsSearchQuery', () => renderChats());

    container.appendChild(list);

    loadIcons();
    return container;
  }

  private renderFriendRequests() {
    this.fetchFriendRequests();
    this.fetchSentFriendRequests();
    const container = DOMUtils.createElement('div');

    const header = DOMUtils.createElement('div', {
      className: 'px-6 pt-6 pb-4 flex items-center gap-4',
    });

    const backButton = DOMUtils.createElement('button', {
      className:
        'border border-pink-300 rounded-full w-6 h-6 p-1 flex items-center justify-center cursor-pointer',
      events: {
        click: () => {
          this.store.setState({
            chatView: {
              label: 'chatsList',
            },
          });
        },
      },
    });
    backButton.appendChild(
      DOMUtils.createElement('i', {
        className: 'w-4',
        attributes: {
          icon: 'leftArrow',
        },
      }),
    );

    header.appendChild(backButton);
    header.appendChild(
      DOMUtils.createElement('p', {
        className: 'text-xl',
        textContent: 'Friend Requests',
      }),
    );

    container.appendChild(header);

    container.appendChild(
      DOMUtils.createElement('p', {
        className: 'mt-4 px-6 font-bold',
        textContent: 'Received requests',
      }),
    );

    const list = DOMUtils.createElement('div');

    const renderRequests = () => {
      const {friendRequests} = this.store.getState();
      list.innerHTML = '';

      if (friendRequests.length === 0) {
        list.appendChild(
          DOMUtils.createElement('p', {
            className: 'pt-2 px-6 italic text-white/50',
            textContent: 'No pending friend request',
          }),
        );
      }

      friendRequests.forEach(request => {
        const line = DOMUtils.createElement('div', {
          className: 'flex items-center justify-between py-2 px-6',
        });
        const leftContent = DOMUtils.createElement('div', {
          className: 'flex items-center justify-start gap-4',
        });

        leftContent.appendChild(
          DOMUtils.createElement('img', {
            className: 'w-12 h-12 rounded-full',
            attributes: {
              src: request.avatar,
            },
          }),
        );

        const text = DOMUtils.createElement('div');
        text.appendChild(
          DOMUtils.createElement('p', {
            className: 'font-bold',
            textContent: request.username,
          }),
        );
        text.appendChild(
          DOMUtils.createElement('p', {
            className: 'text-sm text-white/60',
            textContent: `Received ${getRelativeTime(request.createdAt)}`,
          }),
        );

        leftContent.appendChild(text);
        line.appendChild(leftContent);

        const rightContent = DOMUtils.createElement('div', {
          className: 'flex items-stretch gap-1',
        });
        const acceptButton = DOMUtils.createElement('button', {
          className:
            'border border-white/50 hover:border-pink-300 hover:text-pink-300 hover:bg-pink-300/10 transition-all p-3 rounded-l cursor-pointer',
          events: {
            click: () => {
              this.acceptFriendRequest(
                request.username,
                request.id,
                request.relationshipID,
              );
            },
          },
        });
        acceptButton.appendChild(
          DOMUtils.createElement('i', {
            className: 'w-4 h-4',
            attributes: {
              icon: 'check',
            },
          }),
        );

        const refuseButton = DOMUtils.createElement('button', {
          className:
            'border border-white/50 hover:bg-white/10 transition-all p-3 rounded-r cursor-pointer',
          events: {
            click: () =>
              this.closeRequest(request.username, request.relationshipID),
          },
        });
        refuseButton.appendChild(
          DOMUtils.createElement('i', {
            className: 'w-4 h-4',
            attributes: {
              icon: 'x',
            },
          }),
        );

        rightContent.appendChild(acceptButton);
        rightContent.appendChild(refuseButton);

        line.appendChild(rightContent);
        list.appendChild(line);
        loadIcons();
      });
    };

    this.store.subscribeToPath('friendRequests', renderRequests);
    container.appendChild(list);

    const separator2 = DOMUtils.createElement('div', {
      className: 'flex',
    });
    separator2.appendChild(
      DOMUtils.createElement('p', {
        className: 'mt-8 px-6 font-bold',
        textContent: 'Sent requests',
      }),
    );
    separator2.appendChild(DOMUtils.createElement('hr'));

    container.appendChild(separator2);

    const sentList = DOMUtils.createElement('div');
    const renderSentRequests = () => {
      sentList.innerHTML = '';
      const {sentFriendRequests} = this.store.getState();

      if (sentFriendRequests.length === 0) {
        sentList.appendChild(
          DOMUtils.createElement('p', {
            className: 'pt-2 px-6 italic text-white/50',
            textContent: 'No friend requests sent',
          }),
        );
      }

      sentFriendRequests.forEach(request => {
        const line = DOMUtils.createElement('div', {
          className: 'flex items-center justify-between py-2 px-6',
        });
        const leftContent = DOMUtils.createElement('div', {
          className: 'flex items-center justify-start gap-4',
        });

        leftContent.appendChild(
          DOMUtils.createElement('img', {
            className: 'w-12 h-12 rounded-full',
            attributes: {
              src: request.avatar,
            },
          }),
        );

        const text = DOMUtils.createElement('div');
        text.appendChild(
          DOMUtils.createElement('p', {
            className: 'font-bold',
            textContent: request.username,
          }),
        );
        text.appendChild(
          DOMUtils.createElement('p', {
            className: 'text-sm text-white/60',
            textContent: `Sent ${getRelativeTime(request.createdAt)}`,
          }),
        );

        leftContent.appendChild(text);
        line.appendChild(leftContent);

        const closeButton = DOMUtils.createElement('button', {
          className:
            'border border-white/50 hover:bg-white/10 transition-all p-3 rounded cursor-pointer',
          events: {
            click: () =>
              this.closeRequest(request.username, request.relationshipID),
          },
        });
        closeButton.appendChild(
          DOMUtils.createElement('i', {
            className: 'w-4 h-4',
            attributes: {
              icon: 'x',
            },
          }),
        );

        line.appendChild(closeButton);
        sentList.appendChild(line);
        loadIcons();
      });
    };

    this.store.subscribeToPath('sentFriendRequests', renderSentRequests);
    container.appendChild(sentList);

    loadIcons();
    return container;
  }

  private renderPrivateDiscussion(username: string, userID: number) {
    this.fetchDiscussion(username, userID);

    const container = DOMUtils.createElement('div', {
      className: 'flex flex-col h-full',
    });

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

    container.appendChild(header);

    const messages = DOMUtils.createElement('div', {
      className: 'flex flex-col-reverse gap-2 overflow-y-auto flex-1 px-6 pt-6',
    });
    const renderMessages = () => {
      messages.innerHTML = '';
      const {discussion} = this.store.getState();
      if (!discussion) return;

      if (discussion.messages.length === 0) {
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
            textContent: `Send a first message to start the discussion with ${discussion.user.username}`,
          }),
        );

        messages.appendChild(noChat);
        loadIcons();
        return;
      }

      discussion.messages.forEach(message => {
        const received = message.senderID === discussion.user.id;

        const messageWrapper = DOMUtils.createElement('div', {
          className: 'flex group items-center gap-4',
        });

        const messageContainer = DOMUtils.createElement('div', {
          className: `peer px-4 py-2 rounded-md ${received ? 'border border-pink-300 rounded-tl-none hover:translate-x-1' : 'bg-pink-300 rounded-tr-none hover:-translate-x-1 text-background'} duration-100 leading-tight overflow-x-auto`,
          textContent: message.content,
        });
        const blankSpace = DOMUtils.createElement('div', {
          className: `flex-1 min-w-12 opacity-0 group-hover:opacity-100 text-sm text-white/50 ${received ? 'text-left' : 'text-right'}`,
          textContent: getTimeElapsed(message.createdAt),
        });

        if (received) {
          messageWrapper.appendChild(messageContainer);
          messageWrapper.appendChild(blankSpace);
        } else {
          messageWrapper.appendChild(blankSpace);
          messageWrapper.appendChild(messageContainer);
        }

        messages.appendChild(messageWrapper);
      });
    };

    this.store.subscribeToPath('discussion.messages', renderMessages);
    container.appendChild(messages);

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
      const {user} = this.store.getState();

      console.log('user', user);
      await this.sendPrivateMessage(userID, message);
      input.value = '';
      messages.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start',
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

    messageInput.appendChild(sendButton);
    container.appendChild(messageInput);

    return container;
  }

  private renderGeneralDiscussion() {
    this.fetchDiscussion('general');

    const container = DOMUtils.createElement('div', {
      className: 'flex flex-col h-full',
    });

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
    container.appendChild(header);

    const messages = DOMUtils.createElement('div', {
      className: 'flex flex-col-reverse gap-2 overflow-y-auto flex-1 px-6 pt-6',
    });
    const renderMessages = () => {
      messages.innerHTML = '';
      const {generalDiscussion} = this.store.getState();
      if (!generalDiscussion) return;

      if (generalDiscussion.messages.length === 0) {
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
            textContent: `Send a first message to start the discussion in the general chat`,
          }),
        );

        messages.appendChild(noChat);
        loadIcons();
        return;
      }

      generalDiscussion.messages.forEach(message => {
        const received = true; // TODO: need to implement private routes and user account fetching on page load to correct this
        const sender = generalDiscussion.users[message.userID];

        const messageWrapper = DOMUtils.createElement('div', {
          className: 'flex group items-center gap-4',
        });

        const messageContainer = DOMUtils.createElement('div', {
          className: 'flex items-center gap-2',
        });
        messageContainer.appendChild(
          DOMUtils.createElement('img', {
            className: 'w-8 h-8 rounded-full',
            attributes: {
              src: sender.avatar,
            },
          }),
        );
        const text = DOMUtils.createElement('div', {
          className: `peer px-3 py-[5px] rounded-md ${received ? 'border border-pink-300 rounded-tl-none' : 'bg-pink-300 rounded-tr-none text-background'} duration-100 leading-tight overflow-x-auto`,
        });
        text.appendChild(
          DOMUtils.createElement('p', {
            className: 'text-pink-300/50 text-sm',
            textContent: sender.username,
          }),
        );
        text.appendChild(
          DOMUtils.createElement('p', {
            textContent: message.content,
          }),
        );
        messageContainer.appendChild(text);

        const blankSpace = DOMUtils.createElement('div', {
          className: `flex-1 min-w-12 opacity-0 group-hover:opacity-100 text-sm text-white/50 ${received ? 'text-left' : 'text-right'}`,
          textContent: getTimeElapsed(message.createdAt),
        });

        if (received) {
          messageWrapper.appendChild(messageContainer);
          messageWrapper.appendChild(blankSpace);
        } else {
          messageWrapper.appendChild(blankSpace);
          messageWrapper.appendChild(messageContainer);
        }

        messages.appendChild(messageWrapper);
      });
    };

    this.store.subscribeToPath('generalDiscussion.messages', renderMessages);
    container.appendChild(messages);

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

      await this.sendGeneralMessage(message);
      input.value = '';
      messages.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start',
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

    messageInput.appendChild(sendButton);
    container.appendChild(messageInput);

    return container;
  }

  render(): HTMLElement | undefined {
    const container = DOMUtils.createElement('div', {
      className:
        'w-[400px] h-full flex-none border border-pink-300 rounded-xl flex flex-col',
    });

    const renderView = () => {
      container.innerHTML = '';
      const {chatView} = this.store.getState();
      let view: HTMLDivElement;

      switch (chatView.label) {
        case 'friendRequests':
          view = this.renderFriendRequests();
          break;
        case 'chatsList':
          view = this.renderChatsList();
          break;
        case 'general':
          view = this.renderGeneralDiscussion();
          break;
        default:
          if (chatView.id) {
            view = this.renderPrivateDiscussion(chatView.label, chatView.id);
          } else view = DOMUtils.createElement('div');
      }

      container.appendChild(view);
    };

    renderView();
    this.store.subscribeToPath('chatView', renderView);
    this.store.subscribe(loadIcons);
    return container;
  }
}
