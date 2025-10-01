import {disconnectSession, fetchSessions} from '../../api/account';
import {BaseComponent} from '../../components/BaseComponent';
import {createElement} from '../../utils/dom';
import {getRelativeTime} from '../../utils/string';

export class Sessions extends BaseComponent {
  private renderList(container: HTMLDivElement) {
    const {sessions} = this.store.getState();
    container.innerHTML = '';

    sessions.sessions.forEach(session => {
      const isCurrentSession = session.id === sessions.session;

      const line = createElement('div', {
        className: 'flex items-center justify-between',
      });
      const leftContent = createElement('div', {
        className: 'flex flex-col',
      });

      let title = session.userAgent.browser?.name ?? session.userAgent.ua;
      if (session.userAgent.device.vendor)
        title += ` (${session.userAgent.device.vendor} ${session.userAgent.device.model})`;
      leftContent.appendChild(
        createElement('p', {
          textContent: title,
        }),
      );

      leftContent.appendChild(
        createElement('p', {
          className: 'text-sm text-white/50 leading-tight',
          textContent: isCurrentSession
            ? 'Current session'
            : `Last used ${getRelativeTime(session.updatedAt)}`,
        }),
      );

      line.appendChild(leftContent);

      if (!isCurrentSession) {
        line.appendChild(
          createElement('button', {
            className: `px-4 py-2 rounded-lg border border-white/20 text-white/80 text-sm hover:bg-red-500/10 hover:border-red-500 hover:text-red-500 duration-100 cursor-pointer`,
            textContent: 'Disconnect',
            onclick: () => disconnectSession(session.id),
          }),
        );
      }

      container.appendChild(line);
    });
  }

  render() {
    fetchSessions();

    const container = createElement('div', {
      className: 'flex flex-col gap-4 pt-4 max-h-50 overflow-y-auto',
    });
    this.subscribeToPath('sessions', () => this.renderList(container));
    return container;
  }
}
