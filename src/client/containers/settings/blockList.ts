import {fetchBlockedUsers, unblockUser} from '../../api/relationships';
import {BaseComponent} from '../../components/BaseComponent';
import {createElement} from '../../utils/dom';
import {getRelativeTime} from '../../utils/string';

export class BlockList extends BaseComponent {
  private renderList(container: HTMLDivElement) {
    const {blockedUsers} = this.store.getState();
    container.innerHTML = '';

    if (blockedUsers.length === 0) {
      container.appendChild(
        createElement('p', {
          textContent: 'No users currently blocked',
          className: 'text-white/50 italic',
        }),
      );
      return;
    }

    blockedUsers.forEach(relationship => {
      const line = createElement('div', {
        className: 'flex items-center justify-between',
      });
      const leftContent = createElement('div', {
        className: 'flex flex-col',
      });
      leftContent.appendChild(
        createElement('p', {
          textContent: relationship.username,
        }),
      );
      leftContent.appendChild(
        createElement('p', {
          className: 'text-sm text-white/50 leading-tight',
          textContent: `Blocked ${getRelativeTime(relationship.createdAt)}`,
        }),
      );

      line.appendChild(leftContent);

      line.appendChild(
        createElement('button', {
          className: `px-4 py-2 rounded-lg border border-white/20 text-white/80 text-sm hover:bg-white/10 duration-200 cursor-pointer`,
          textContent: 'Unblock',
          events: {
            click: () => unblockUser(relationship.relationshipID),
          },
        }),
      );

      container.appendChild(line);
    });
  }

  render() {
    fetchBlockedUsers();

    const container = createElement('div', {
      className: 'pt-4 flex flex-col gap-4 max-h-60 overflow-y-auto',
    });
    this.subscribeToPath('blockedUsers', () => this.renderList(container));
    return container;
  }
}
