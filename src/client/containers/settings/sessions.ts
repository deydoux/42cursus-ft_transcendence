import {DOMUtils} from '../../utils/dom';
import {Store} from '../../services/store';
import {Toastify} from '../../utils/toastify';
import {api} from '../../utils/Api';
import {getRelativeTime} from '../../utils/string';

export class Sessions {
  constructor(private store: Store) {}

  private async fetchSessions() {
    try {
      const response = await api.get('account/sessions');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const data = await response.json();
      this.store.setState({sessions: data});
    } catch (error) {
      Toastify.error('An error occurred while fetching the user sessions');
      console.error(error);
    }
  }

  private async disconnectSession(sessionID?: number) {
    try {
      const response = await api.delete(
        sessionID ? `account/sessions/${sessionID}` : 'account/sessions',
        {},
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      this.fetchSessions();
      Toastify.success(
        `Session${sessionID ? '' : 's'} disconnected successfully`,
      );
    } catch (error) {
      Toastify.error('An error occurred while fetching the user sessions');
      console.error(error);
    }
  }

  render(disconnectAllButton: HTMLButtonElement) {
    this.fetchSessions();
    const container = DOMUtils.createElement('div', {
      className: 'flex flex-col gap-4 pt-4 max-h-60 overflow-y-auto',
    });

    disconnectAllButton.onclick = () => {
      this.disconnectSession();
    };

    const renderList = () => {
      container.innerHTML = '';
      const {sessions} = this.store.getState();
      sessions.sessions.forEach(session => {
        const isCurrentSession = session.id === sessions.session;

        const line = DOMUtils.createElement('div', {
          className: 'flex items-center justify-between',
        });
        const leftContent = DOMUtils.createElement('div', {
          className: 'flex flex-col',
        });

        let title = session.userAgent.browser?.name ?? session.userAgent.ua;
        if (session.userAgent.device.vendor)
          title += ` (${session.userAgent.device.vendor} ${session.userAgent.device.model})`;
        leftContent.appendChild(
          DOMUtils.createElement('p', {
            textContent: title,
          }),
        );

        leftContent.appendChild(
          DOMUtils.createElement('p', {
            className: 'text-sm text-white/50 leading-tight',
            textContent: isCurrentSession
              ? 'Current session'
              : `Last used ${getRelativeTime(session.updatedAt)}`,
          }),
        );

        line.appendChild(leftContent);

        if (!isCurrentSession) {
          line.appendChild(
            DOMUtils.createElement('button', {
              className:
                'px-4 py-2 rounded-lg border border-white/20 text-white/80 text-sm hover:bg-red-500/10 hover:border-red-500 hover:text-red-500 duration-100 cursor-pointer',
              textContent: 'Disconnect',
              events: {
                click: () => {
                  this.disconnectSession(session.id);
                },
              },
            }),
          );
        }

        container.appendChild(line);
      });
    };

    this.store.subscribeToPath('sessions', () => renderList());
    return container;
  }
}
