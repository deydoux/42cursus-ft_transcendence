import {BaseComponent} from '../../components/BaseComponent';
import {Toastify} from '../../utils/toastify';
import {createElement} from '../../utils/dom';

export class TournamentLobby extends BaseComponent {
  private renderParticipantsList(container: HTMLDivElement) {
    container.innerHTML = '';
    const {joinedTournament, user} = this.store.getState();
    if (!user || !joinedTournament) {
      Toastify.error('Unable to find joined tournament or user');
      return;
    }

    const participants = [...joinedTournament.participants, user];
    participants
      .sort(p => (p.id === joinedTournament.owner.id ? -1 : 1))
      .forEach(participant => {
        const isOwner = participant.id === joinedTournament.owner.id;
        const row = createElement('div', {
          className: `relative flex items-center justify-between border-b px-3 py-3 last:border-none ${isOwner ? 'bg-pink-300/10' : 'hover:bg-white/5'} `,
        });

        const leftContent = createElement('div', {
          className: 'flex items-center',
        });

        if (isOwner) {
          leftContent.appendChild(
            createElement('i', {
              className: 'absolute text-pink-300 top-1 left-1',
              icon: 'star',
            }),
          );
        }

        leftContent.appendChild(
          createElement('img', {
            className: 'w-8 h-8 rounded-full mr-3',
            attributes: {
              src: participant.avatar,
            },
          }),
        );
        leftContent.appendChild(
          createElement('p', {
            textContent: participant.username,
          }),
        );

        if (participant.id === user.id) {
          leftContent.appendChild(
            createElement('p', {
              className: 'text-white/50 italic ml-2 text-sm',
              textContent: '(you)',
            }),
          );
        }

        row.appendChild(leftContent);

        if (
          user.id === joinedTournament.owner.id &&
          participant.id !== user.id
        ) {
          const rightContent = createElement('button', {
            className: `text-white/50 hover:text-red-500 cursor-pointer text-sm mr-2 flex items-center justify-center`,
          });
          rightContent.onclick = () => {
            this.websocket.send({
              type: 'kickParticipant',
              participantID: participant.id,
            });
          };
          rightContent.appendChild(
            createElement('i', {
              className: 'w-6 h-6',
              icon: 'x',
            }),
          );
          row.appendChild(rightContent);
        }

        container.appendChild(row);
      });
  }

  render(): HTMLElement {
    const container = createElement('div', {
      className: 'flex-1 flex flex-col justify-center items-center',
    });

    const wrapper = createElement('div', {
      className: `flex flex-col items-center justify-center gap-8 w-full h-full`,
    });

    const participantsList = createElement('div', {
      className: 'border rounded-lg flex flex-col w-60',
    });

    wrapper.appendChild(participantsList);
    this.renderParticipantsList(participantsList);
    this.subscribeToPath('joinedTournament.participants', () =>
      this.renderParticipantsList(participantsList),
    );

    const statusText = createElement('p', {
      className: `py-2 px-4 bg-pink-300/10 rounded-lg text-pink-300 border border-pink-300/20`,
    });
    const actionButtons = createElement('div', {
      className: 'flex items-center justify-center gap-4',
    });
    const startButton = createElement('button', {
      className: `border border-pink-300 py-2 px-4 rounded-lg text-white enabled:cursor-pointer disabled:border-white/30 disabled:text-white/20 hover:bg-pink-300/20 duration-100 disabled:bg-background`,
      textContent: 'Start the tournament',
      onclick: () => {
        this.websocket.send({
          type: 'startTournament',
        });
      },
    });
    const quitButton = createElement('button', {
      textContent: 'Quit tournament',
      className: `border border-red-500/80 bg-red-500/10 text-red-500/80 hover:border-red-500 py-2 px-4 rounded-lg hover:text-red-500 hover:bg-red-500/20 cursor-pointer duration-100`,
      onclick: () => {
        this.websocket.send({
          type: 'leaveTournament',
        });
        this.store.setState({
          tournamentView: 'tournaments',
          joinedTournament: undefined,
        });
      },
    });

    const renderStatusText = () => {
      const {joinedTournament, user} = this.store.getState();
      if (!joinedTournament || !user) {
        Toastify.error('Could not find joined tournament or user');
        return;
      }

      if (joinedTournament.participantCount <= 1) {
        statusText.textContent = `Waiting for other players to join the tournament ...`;
        startButton.disabled = true;
      } else {
        statusText.innerHTML = `Waiting for ${
          user.id === joinedTournament.owner.id
            ? 'you'
            : `<span class="text-white">${joinedTournament.owner.username}</span>`
        } to start the tournament`;
        startButton.disabled = user.id !== joinedTournament.owner.id;
      }
    };

    wrapper.appendChild(statusText);
    actionButtons.appendChild(quitButton);
    actionButtons.appendChild(startButton);
    wrapper.appendChild(actionButtons);
    this.subscribeToPath('joinedTournament.participantCount', renderStatusText);
    renderStatusText();

    container.appendChild(wrapper);
    return container;
  }
}
