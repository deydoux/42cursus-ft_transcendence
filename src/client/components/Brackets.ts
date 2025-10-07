import {Store} from '../services/store';
import {createElement} from '../utils/dom';
import {round} from '../types';

const renderBracket = (round: round, isFinal = true) => {
  const store = Store.getInstance();
  const {user} = store.getState();

  const container = createElement('div', {
    className: 'flex items-center  z-10',
  });

  const bracketBorderColor =
    user && round.participants.find(p => p.id === user.id)
      ? 'border-pink-300 bg-pink-300/10'
      : round.participants.length === 2
        ? 'border-white'
        : 'border-white/50';

  const bracket = createElement('div', {
    className: `border rounded-2xl min-w-50 flex flex-col p-3 gap-2 min-h-[82px] ${bracketBorderColor}`,
  });

  round.participants.forEach(participant => {
    const row = createElement('div', {
      className: 'flex items-center justify-between gap-2 text-sm',
    });

    const leftContent = createElement('div', {
      className: 'flex items-center gap-2',
    });
    leftContent.appendChild(
      createElement('img', {
        className: 'rounded-full w-6 h-6',
        attributes: {
          src: participant.avatar,
        },
      }),
    );
    leftContent.appendChild(
      createElement('p', {
        textContent: participant.username,
        className: `text-sm ${user && user.id === participant.id ? 'font-semibold' : ''}`,
      }),
    );
    if (user && user.id === participant.id) {
      leftContent.appendChild(
        createElement('p', {
          textContent: '(you)',
          className: `italic text-pink-300/50 -ml-1`,
        }),
      );
    }

    row.appendChild(leftContent);

    const isParticipantWinner =
      round.winnerID && round.winnerID === participant.id;
    const rightContent = createElement('p', {
      textContent: participant.score ? participant.score.toString() : '-',
      className: isParticipantWinner ? 'text-pink-300' : '',
    });

    row.appendChild(rightContent);

    bracket.appendChild(row);
  });

  const createLink = () => {
    return createElement('div', {
      className: `border-b w-4 ${bracketBorderColor}`,
    });
  };

  if (round.rounds.length > 0) container.appendChild(createLink());
  container.appendChild(bracket);
  if (!isFinal) container.appendChild(createLink());

  return container;
};

export const renderBrackets = (round: round, isFirst = true) => {
  const container = createElement('div', {
    className: 'flex items-center',
  });

  const nextRounds = createElement('div', {
    className: 'relative flex flex-col gap-3',
  });
  round.rounds.forEach(round => {
    nextRounds.appendChild(renderBrackets(round, false));
  });

  const overlay = createElement('div', {
    className: `absolute w-full h-full flex flex-col justify-center z-0`,
  });
  overlay.appendChild(
    createElement('div', {
      className: 'h-[calc(50%+5px)] w-full border-r',
    }),
  );
  nextRounds.appendChild(overlay);

  container.appendChild(nextRounds);
  container.appendChild(renderBracket(round, isFirst));
  return container;
};
