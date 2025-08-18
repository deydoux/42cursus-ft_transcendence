import {DOMUtils} from '../../utils/dom';
import {Store} from '../../services/store';
import {Toastify} from '../../utils/toastify';
import {api} from '../../utils/Api';
import {getRelativeTime} from '../../utils/string';

export class BlockList {
  constructor(private store: Store) {}

  private async fetchBlockedUsers() {
    try {
      const response = await api.get('relationships/block');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const data = await response.json();
      this.store.setState({blockedUsers: data});
    } catch (error) {
      Toastify.error('An error occurred while fetching blocked users');
      console.error(error);
    }
  }

  private async unblockUser(relationshipID: number) {
    try {
      const response = await api.delete(`relationships/${relationshipID}`, {});

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      this.fetchBlockedUsers();
      Toastify.success('User unblocked successfully');
    } catch (error) {
      Toastify.error('An error occurred while unblocking a user');
      console.error(error);
    }
  }

  render() {
    this.fetchBlockedUsers();
    const container = DOMUtils.createElement('div', {
      className: 'pt-4 flex flex-col gap-4 max-h-60 overflow-y-auto',
    });

    const renderList = () => {
      const {blockedUsers} = this.store.getState();
      container.innerHTML = '';

      if (blockedUsers.length === 0) {
        container.appendChild(
          DOMUtils.createElement('p', {
            textContent: 'No users currently blocked',
            className: 'text-white/50 italic',
          }),
        );
        return;
      }

      blockedUsers.forEach(relationship => {
        const line = DOMUtils.createElement('div', {
          className: 'flex items-center justify-between',
        });
        const leftContent = DOMUtils.createElement('div', {
          className: 'flex flex-col',
        });
        leftContent.appendChild(
          DOMUtils.createElement('p', {
            textContent: relationship.username,
          }),
        );
        leftContent.appendChild(
          DOMUtils.createElement('p', {
            className: 'text-sm text-white/50 leading-tight',
            textContent: `Blocked ${getRelativeTime(relationship.createdAt)}`,
          }),
        );

        line.appendChild(leftContent);

        line.appendChild(
          DOMUtils.createElement('button', {
            className:
              'px-4 py-2 rounded-lg border border-white/20 text-white/80 text-sm hover:bg-white/10 duration-200 cursor-pointer',
            textContent: 'Unblock',
            events: {
              click: () => {
                this.unblockUser(relationship.relationshipID);
              },
            },
          }),
        );

        container.appendChild(line);
      });
    };

    this.store.subscribeToPath('blockedUsers', () => renderList());
    return container;
  }
}
