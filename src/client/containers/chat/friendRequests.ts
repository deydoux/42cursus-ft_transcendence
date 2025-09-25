import {
  acceptFriendRequest,
  closeRequest,
  fetchFriendRequests,
  fetchSentFriendRequests,
} from '../../api/relationships';
import {BaseComponent} from '../../components/BaseComponent';
import {createElement} from '../../utils/dom';
import {getRelativeTime} from '../../utils/string';
import {loadIcons} from '../../utils/icons';
import {renderUserContextMenu} from './userContextMenu';

export class FriendRequests extends BaseComponent {
  private renderHeader() {
    const header = createElement('div', {
      className: 'px-6 pt-6 pb-4 flex items-center gap-4',
    });

    const backButton = createElement('button', {
      className: `border border-pink-300 rounded-full w-6 h-6 p-1 flex items-center justify-center cursor-pointer`,
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
      createElement('i', {
        className: 'w-4',
        icon: 'leftArrow',
      }),
    );

    header.appendChild(backButton);
    header.appendChild(
      createElement('p', {
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
    const container = createElement('div', {
      className: 'flex items-center justify-start gap-4',
    });

    container.appendChild(
      createElement('img', {
        className: 'w-12 h-12 rounded-full',
        attributes: {
          src: request.avatar,
        },
      }),
    );

    const text = createElement('div');
    text.appendChild(
      createElement('p', {
        className: 'font-bold',
        textContent: request.username,
      }),
    );
    text.appendChild(
      createElement('p', {
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
    const button = createElement('button', {
      className: `border border-white/50 transition-all p-3 rounded cursor-pointer ${type === 'close' ? 'hover:bg-white/10' : 'hover:border-pink-300 hover:text-pink-300 hover:bg-pink-300/10'}`,
      onclick: () => {
        if (type === 'close')
          closeRequest(request.username, request.relationshipID);
        else
          acceptFriendRequest(
            request.username,
            request.id,
            request.relationshipID,
          );
      },
    });
    button.appendChild(
      createElement('i', {
        className: 'w-4 h-4',
        icon: type === 'close' ? 'x' : 'check',
      }),
    );

    return button;
  }

  private renderReceivedRequests(list: HTMLDivElement) {
    const {friendRequests} = this.store.getState();
    list.innerHTML = '';

    if (friendRequests.length === 0) {
      list.appendChild(
        createElement('p', {
          className: 'pt-2 px-6 italic text-white/50',
          textContent: 'No pending friend request',
        }),
      );
    }

    friendRequests.forEach(request => {
      const line = createElement('div', {
        className: 'flex items-center justify-between py-2 px-6',
      });
      line.oncontextmenu = evt => {
        evt.preventDefault();
        renderUserContextMenu(request, ['block'], [evt.pageX, evt.pageY]);
      };

      line.appendChild(this.renderRequestUserInfo(request));

      const rightContent = createElement('div', {
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
        createElement('p', {
          className: 'pt-2 px-6 italic text-white/50',
          textContent: 'No friend requests sent',
        }),
      );
    }

    sentFriendRequests.forEach(request => {
      const line = createElement('div', {
        className: 'flex items-center justify-between py-2 px-6',
      });
      line.appendChild(this.renderRequestUserInfo(request));
      line.appendChild(this.renderActionButton('close', request));
      list.appendChild(line);
      loadIcons();
    });
  }

  render() {
    fetchFriendRequests();
    fetchSentFriendRequests();

    const container = createElement('div');

    container.appendChild(this.renderHeader());

    // Received Requests
    container.appendChild(
      createElement('p', {
        className: 'mt-4 px-6 font-bold',
        textContent: 'Received requests',
      }),
    );
    const receivedList = createElement('div');
    this.renderReceivedRequests(receivedList);

    this.subscribeToPath('friendRequests', () =>
      this.renderReceivedRequests(receivedList),
    );
    container.appendChild(receivedList);

    // Sent Requests
    container.appendChild(
      createElement('p', {
        className: 'mt-8 px-6 font-bold',
        textContent: 'Sent requests',
      }),
    );
    const sentList = createElement('div');
    this.renderSentRequests(sentList);

    this.subscribeToPath('sentFriendRequests', () =>
      this.renderSentRequests(sentList),
    );
    container.appendChild(sentList);

    return container;
  }
}
