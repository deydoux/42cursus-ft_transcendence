import {DOMUtils} from '../../utils/dom';
import {Store} from '../../services/store';
import {Toastify} from '../../utils/toastify';
import {api} from '../../utils/Api';
import {getRelativeTime} from '../../utils/string';
import {loadIcons} from '../../utils/icons';
import {renderUserContextMenu} from './userContextMenu';

export class FriendRequests {
  constructor(private store: Store) {}

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

  static async acceptFriendRequest(
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

      const store = Store.getInstance();

      const {friendRequests} = store.getState();

      const filteredRequests = friendRequests.filter(request => {
        return request.username !== username;
      });
      store.setState({
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

  static async closeRequest(username: string, relationshipID: number) {
    try {
      const response = await api.delete(`relationships/${relationshipID}`, {});

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const store = Store.getInstance();

      const {friendRequests, sentFriendRequests} = store.getState();
      store.setState({
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

  private renderHeader() {
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

    return header;
  }

  private renderRequestUserInfo(request: {
    avatar: string;
    username: string;
    createdAt: string;
  }) {
    const container = DOMUtils.createElement('div', {
      className: 'flex items-center justify-start gap-4',
    });

    container.appendChild(
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

    container.appendChild(text);
    return container;
  }

  private renderActionButton(
    type: 'accept' | 'close',
    request: {username: string; relationshipID: number; id: number},
  ) {
    const button = DOMUtils.createElement('button', {
      className: `border border-white/50 transition-all p-3 rounded cursor-pointer ${type === 'close' ? 'hover:bg-white/10' : 'hover:border-pink-300 hover:text-pink-300 hover:bg-pink-300/10'}`,
      events: {
        click: () => {
          if (type === 'close')
            FriendRequests.closeRequest(
              request.username,
              request.relationshipID,
            );
          else
            FriendRequests.acceptFriendRequest(
              request.username,
              request.id,
              request.relationshipID,
            );
        },
      },
    });
    button.appendChild(
      DOMUtils.createElement('i', {
        className: 'w-4 h-4',
        attributes: {
          icon: type === 'close' ? 'x' : 'check',
        },
      }),
    );

    return button;
  }

  private renderReceivedRequests(list: HTMLDivElement) {
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
      line.oncontextmenu = evt => {
        evt.preventDefault();
        renderUserContextMenu(request, ['block'], [evt.pageX, evt.pageY]);
      };

      line.appendChild(this.renderRequestUserInfo(request));

      const rightContent = DOMUtils.createElement('div', {
        className: 'flex items-stretch gap-1',
      });

      rightContent.appendChild(this.renderActionButton('accept', request));
      rightContent.appendChild(this.renderActionButton('close', request));

      line.appendChild(rightContent);
      list.appendChild(line);
      loadIcons();
    });
  }

  private renderSentRequests(list: HTMLDivElement) {
    const {sentFriendRequests} = this.store.getState();
    list.innerHTML = '';

    if (sentFriendRequests.length === 0) {
      list.appendChild(
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
      line.appendChild(this.renderRequestUserInfo(request));
      line.appendChild(this.renderActionButton('close', request));
      list.appendChild(line);
      loadIcons();
    });
  }

  render() {
    this.fetchFriendRequests();
    this.fetchSentFriendRequests();

    const container = DOMUtils.createElement('div');

    container.appendChild(this.renderHeader());

    // Received Requests
    container.appendChild(
      DOMUtils.createElement('p', {
        className: 'mt-4 px-6 font-bold',
        textContent: 'Received requests',
      }),
    );
    const receivedList = DOMUtils.createElement('div');
    this.renderReceivedRequests(receivedList);

    this.store.subscribeToPath('friendRequests', () =>
      this.renderReceivedRequests(receivedList),
    );
    container.appendChild(receivedList);

    // Sent Requests
    container.appendChild(
      DOMUtils.createElement('p', {
        className: 'mt-8 px-6 font-bold',
        textContent: 'Sent requests',
      }),
    );
    const sentList = DOMUtils.createElement('div');
    this.renderSentRequests(sentList);

    this.store.subscribeToPath('sentFriendRequests', () =>
      this.renderSentRequests(sentList),
    );
    container.appendChild(sentList);

    return container;
  }
}
