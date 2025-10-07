import {BaseComponent} from '../components/BaseComponent';
import {Toastify} from '../utils/toastify';
import {createDialog} from '../components/Dialog';
import {createElement} from '../utils/dom';
import {fetchTournaments} from '../api/tournaments';
import {renderBrackets} from '../components/Brackets';
import {round} from '../types';
import {socket} from '../utils/websocket';

export class Tournament extends BaseComponent {
  constructor(private chat: HTMLElement) {
    super();
  }

  private renderBanner() {
    const container = createElement('div', {
      className: `mb-8 w-full h-38 bg-linear-to-br from-pink-200 to-pink-300 text-background flex items-center justify-between px-16 rounded-lg  shadow-lg shadow-pink-300/30`,
    });

    const bannerTitle = createElement('div');
    bannerTitle.appendChild(
      createElement('h1', {
        className: 'text-3xl font-bold',
        textContent: 'Tournaments',
      }),
    );
    bannerTitle.appendChild(
      createElement('p', {
        className: 'opacity-70',
        textContent: `Join a tournament to play pong with many friends, or create your own`,
      }),
    );
    container.appendChild(bannerTitle);

    const {dialogContent, showModal, close} = createDialog('create-tournament');
    const createTournament = createElement('form', {
      className: `p-10 bg-background text-white border border-white/50 rounded-xl flex flex-col`,
    });
    createTournament.onsubmit = evt => {
      evt.preventDefault();
      const formdata = new FormData(evt.target as HTMLFormElement);

      const {user} = this.store.getState();
      if (!user) return;
      this.store.setState({
        joinedTournament: {
          name: formdata.get('name')?.toString() ?? '',
          participantCount: 1,
          participants: [],
          owner: user,
        },
      });

      socket.send(
        JSON.stringify({
          type: 'createTournament',
          name: formdata.get('name'),
        }),
      );
      close();
    };

    createTournament.appendChild(
      createElement('h2', {
        textContent: 'Create a new tournament',
        className: 'font-semibold text-2xl',
      }),
    );
    createTournament.appendChild(
      createElement('p', {
        textContent: `Choose the perfect name for your tournament so your friends will know which one to join`,
        className: 'text-white/50 max-w-[400px] leading-tight mb-4',
      }),
    );
    createTournament.appendChild(
      createElement('input', {
        textContent: 'Create a new tournament',
        className: `px-4 py-2 border border-pink-300/50 focus:border-white outline-none w-full mb-4 rounded-lg`,
        attributes: {
          placeholder: 'Tournament name...',
          name: 'name',
        },
      }),
    );
    createTournament.appendChild(
      createElement('button', {
        textContent: 'Create',
        className:
          'px-4 py-2 border border-pink-300 hover:bg-pink-300/20 ml-auto rounded-lg cursor-pointer',
        attributes: {
          type: 'submit',
        },
      }),
    );

    dialogContent.appendChild(createTournament);

    const createButton = createElement('button', {
      className: `bg-background text-pink-300 py-3 px-4 rounded-lg cursor-pointer duration-200 flex items-center gap-2`,
      onclick: showModal,
    });

    createButton.appendChild(
      createElement('i', {
        className: 'w-5 h-5',
        icon: 'plus',
      }),
    );
    createButton.appendChild(
      createElement('p', {
        textContent: 'Create a tournament',
      }),
    );

    container.appendChild(createButton);
    return container;
  }

  private renderTournamentsList(container: HTMLDivElement) {
    const {tournaments} = this.store.getState();
    if (!tournaments) return;
    container.innerHTML = '';

    if (tournaments.length === 0) {
      container.appendChild(
        createElement('div', {
          textContent:
            'No tournament waiting to be joined right now. Create your own!',
          className:
            'flex-1 flex items-center justify-center text-white/50 italic',
        }),
      );
      return;
    }

    tournaments.forEach(tournament => {
      const tournamentCard = createElement('div', {
        className:
          'border border-pink-300 rounded-lg h-fit overflow-hidden hover:-translate-y-1 duration-100',
      });

      const cardHeader = createElement('div', {
        className: `bg-gradient-to-br from-pink-300/20 to-background flex items-center justify-between border-b border-pink-300/30 px-4 py-3`,
      });
      cardHeader.appendChild(
        createElement('h4', {
          className: `text-xl font-medium text-wrap leading-tight`,
          textContent: tournament.name,
        }),
      );

      const usersCounter = createElement('div', {
        className: 'flex items-center text-sm gap-1',
      });
      usersCounter.appendChild(
        createElement('i', {
          className: 'w-4 h-4',
          icon: 'users',
        }),
      );
      usersCounter.appendChild(
        createElement('p', {
          className: 'font-light',
          textContent: `${tournament.participantCount}/8`,
        }),
      );

      cardHeader.appendChild(usersCounter);
      tournamentCard.appendChild(cardHeader);

      const cardContent = createElement('p', {
        className: 'px-4 py-3 flex items-center gap-1',
      });
      cardContent.appendChild(
        createElement('span', {
          textContent: 'Owned by',
        }),
      );
      cardContent.appendChild(
        createElement('img', {
          className: 'w-5 h-5 rounded-full ml-1',
          attributes: {
            src: tournament.owner.avatar,
          },
        }),
      );
      cardContent.appendChild(
        createElement('span', {
          className: 'text-pink-300',
          textContent: tournament.owner.username,
        }),
      );

      tournamentCard.appendChild(cardContent);

      tournamentCard.appendChild(
        createElement('button', {
          textContent: 'Join',
          className: `w-full py-2 border-t border-pink-300/30 cursor-pointer hover:bg-pink-300/10 duration-100`,
          onclick: () => {
            this.store.setState({
              joinedTournament: {
                ...tournament,
                participants: [],
              },
            });
            socket.send(
              JSON.stringify({
                type: 'joinTournament',
                tournamentID: tournament.id,
              }),
            );
          },
        }),
      );

      container.appendChild(tournamentCard);
    });
  }

  private renderTournamentsPage(container: HTMLDivElement) {
    fetchTournaments();

    container.innerHTML = '';

    container.appendChild(this.renderBanner());

    const tournamentsList = createElement('div', {
      className: 'flex-1 grid grid-cols-3 gap-6',
    });
    this.renderTournamentsList(tournamentsList);
    container.appendChild(tournamentsList);
    this.subscribeToPath('tournaments', () =>
      this.renderTournamentsList(tournamentsList),
    );
  }

  private renderTournamentLobby(container: HTMLDivElement) {
    container.innerHTML = '';

    const wrapper = createElement('div', {
      className: `flex flex-col items-center justify-center gap-8 w-full h-full`,
    });

    const participantsList = createElement('div', {
      className: 'border rounded-lg flex flex-col w-60',
    });
    const renderParticipantsList = () => {
      participantsList.innerHTML = '';
      const {joinedTournament, user} = this.store.getState();
      if (!user || !joinedTournament) {
        Toastify.error('Unable to find joined tournament or user');
        return;
      }

      const participants = [...joinedTournament.participants, user];

      participants.forEach(participant => {
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
          rightContent.appendChild(
            createElement('i', {
              className: 'w-6 h-6',
              icon: 'x',
            }),
          );
          row.appendChild(rightContent);
        }

        participantsList.appendChild(row);
      });
    };

    renderParticipantsList();
    wrapper.appendChild(participantsList);
    this.subscribeToPath(
      'joinedTournament.participants',
      renderParticipantsList,
    );

    const statusText = createElement('p', {
      className: `py-2 px-4 bg-pink-300/10 rounded-lg text-pink-300 border border-pink-300/20`,
    });
    const startButton = createElement('button', {
      className: `border border-pink-300 py-2 px-4 rounded-lg text-white cursor-pointer disabled:border-white/30 disabled:text-white/20 hover:bg-pink-300/20 duration-100 disabled:bg-background`,
      textContent: 'Start the tournament',
      onclick: () => {
        socket.send({
          type: 'startTournament',
        });
      },
    });

    const renderStatusText = () => {
      const {joinedTournament, user} = this.store.getState();
      if (!joinedTournament || !user) {
        Toastify.error('Could no find joined tournament or user');
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
    wrapper.appendChild(startButton);
    this.subscribeToPath('joinedTournament.participantCount', renderStatusText);
    renderStatusText();

    container.appendChild(wrapper);
  }

  private renderTournamentBrackets = (container: HTMLDivElement) => {
    container.innerHTML = '';

    const {joinedTournament} = this.store.getState();
    if (!joinedTournament || !joinedTournament.rounds) return;

    container.appendChild(renderBrackets(joinedTournament.rounds));

    const isUserInRound = (round: round, userId: number) => {
      return round.participants?.some(p => p.id === userId) || false;
    };

    const searchRounds = (round: round, userId: number, depth = 0) => {
      if (isUserInRound(round, userId)) {
        return {round, depth};
      }

      if (round.rounds && round.rounds.length > 0) {
        let closestMatch: {round: round; depth: number} | null = null;
        let minDepth = Infinity;

        round.rounds.forEach(subRound => {
          const result = searchRounds(subRound, userId, depth + 1);
          if (result && result.depth < minDepth) {
            minDepth = result.depth;
            closestMatch = result;
          }
        });

        return closestMatch;
      }

      return null;
    };

    const {user} = this.store.getState();
    if (!user) throw new Error('No user');
    const closestMatch = searchRounds(joinedTournament.rounds, user.id);
    if (!closestMatch) throw new Error('User not found in tournament');

    const statusText = createElement('p', {
      className: `mt-10 py-2 px-4 bg-pink-300/10 rounded-lg text-pink-300 border border-pink-300/20`,
    });
    container.appendChild(statusText);

    const opponent = closestMatch.round.participants.find(
      participant => participant.id !== user.id,
    );
    const waitingForRound = closestMatch.round.rounds.find(
      round => !isUserInRound(round, user.id),
    );

    if (
      closestMatch.round.winnerID &&
      closestMatch.round.winnerID !== user.id
    ) {
      statusText.textContent = `Unfortunately, you lost this tournament :(`;
      container.appendChild(
        createElement('button', {
          textContent: 'Quit tournament',
          className: `mt-4 border hover:border-red-500 text-white py-2 px-4 rounded-lg hover:text-red-500 hover:bg-red-500/20 cursor-pointer duration-100`,
          onclick: () => {
            socket.send(
              JSON.stringify({
                type: 'leaveTournament',
              }),
            );
          },
        }),
      );
    } else if (opponent) {
      statusText.innerHTML = `Your match with <span className="text-white">${opponent.username}</span> will start in a few`;
    } else if (waitingForRound) {
      statusText.innerHTML = `Waiting for <span class="text-white">${waitingForRound.participants.map(p => p.username).join('</span> and <span class="text-white">')}</span> to finish their match`;
    }
  };

  render(): HTMLElement {
    const container = createElement('div', {
      className: 'w-full h-full flex items-center gap-10',
    });
    const pageContent = createElement('div', {
      className: 'flex-1 flex flex-col justify-start h-full',
    });

    const renderPageContent = () => {
      const {tournamentView, joinedTournament} = this.store.getState();
      pageContent.innerHTML = '';

      if (tournamentView === 'tournaments') {
        this.renderTournamentsPage(pageContent);
      } else if (joinedTournament) {
        const header = createElement('div', {
          className: `flex-none py-10 w-full border border-white/30 rounded-lg mb-10 text-center text-3xl bg-white/5 font-semibold`,
          textContent: `${joinedTournament.name}`,
        });
        header.appendChild(
          createElement('p', {
            className: 'text-lg text-white/50 font-normal',
            textContent: 'Tournament lobby',
          }),
        );
        pageContent.appendChild(header);

        const wrapper = createElement('div', {
          className: 'flex-1 flex flex-col justify-center items-center',
        });

        if (tournamentView === 'lobby' && joinedTournament.rounds) {
          this.renderTournamentBrackets(wrapper);
        } else {
          this.renderTournamentLobby(wrapper);
        }
        pageContent.appendChild(wrapper);
      }
    };

    renderPageContent();
    this.subscribeToPath('tournamentView', renderPageContent);
    this.subscribeToPath('joinedTournament.isActive', renderPageContent);

    container.appendChild(pageContent);
    if (this.chat) container.appendChild(this.chat);
    return container;
  }
}
