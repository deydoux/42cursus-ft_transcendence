import {round, user} from '../types';
import {Router} from '../services/router';
import {Socket} from '../services/websocket';
import {Store} from '../services/store';
import {Toastify} from '../utils/toastify';

const handleNewTournament = (data: {
  tournament: {
    id: number;
    name: string;
    participantCount: number;
    owner: {
      id: number;
      username: string;
      avatar: string;
    };
  };
}) => {
  const store = Store.getInstance();

  const {tournaments} = store.getState();
  store.setState({
    tournaments: [...tournaments, data.tournament],
  });
};

const handleTournamentJoined = (data: {
  participants: {
    id: number;
    username: string;
    avatar: string;
  }[];
}) => {
  const store = Store.getInstance();

  const {joinedTournament} = store.getState();
  if (!joinedTournament) {
    Toastify.error('Could not resolve joined tournament');
    return;
  }

  store.setState({
    tournamentView: 'lobby',
    joinedTournament: {
      ...joinedTournament,
      participants: data.participants,
      participantCount: data.participants.length + 1,
    },
  });
};

const handleParticipantJoin = (data: {
  user: {
    id: number;
    username: string;
    avatar: string;
  };
}) => {
  const store = Store.getInstance();

  const {joinedTournament} = store.getState();
  if (!joinedTournament) {
    Toastify.error('Could not resolve joined tournament');
    return;
  }

  store.setState({
    joinedTournament: {
      ...joinedTournament,
      participants: [...joinedTournament.participants, data.user],
      participantCount: joinedTournament.participantCount + 1,
    },
  });
};

const handleParticipantLeft = (data: {userID: number; ownerID: number}) => {
  const store = Store.getInstance();

  const {joinedTournament, user} = store.getState();
  if (!joinedTournament || !user) {
    Toastify.error('Could not resolve joined tournament or user');
    return;
  }

  const newOwner =
    user.id === data.ownerID
      ? user
      : joinedTournament.participants.find(p => p.id === data.ownerID);
  if (!newOwner) {
    Toastify.error(
      `Could not resolve new owner of tournament after participant left`,
    );
    return;
  }

  store.setState({
    joinedTournament: {
      ...joinedTournament,
      owner: newOwner,
      participantCount: joinedTournament.participantCount - 1,
      participants: joinedTournament.participants.filter(
        p => p.id !== data.userID,
      ),
    },
  });
};

const handleTournamentStarted = (data: {final: round}) => {
  const store = Store.getInstance();

  const {joinedTournament} = store.getState();
  if (!joinedTournament) {
    Toastify.error('Could not resolve joined tournament');
    return;
  }

  store.setState({
    joinedTournament: {
      ...joinedTournament,
      rounds: data.final,
    },
  });
};

const handleTournamentMatchEnd = (data: {
  roundID: number;
  nextRoundID: number | undefined;
  winnerID: number;
  participants: (user & {score: number})[];
  result?: 'cancel' | 'forfeit' | 'tie' | 'empty';
}) => {
  const store = Store.getInstance();
  const router = Router.getInstance();
  const {joinedTournament} = store.getState();
  if (!joinedTournament || !joinedTournament.rounds) return;

  const {user} = store.getState();
  if (user && data.participants.find(p => p.id === user.id)) {
    router.navigate('/tournament');
    store.setState({tournamentView: 'lobby'});
  }

  const updateRoundImmutably = (
    round: round | undefined,
    data: {
      roundID: number;
      nextRoundID: number | undefined;
      winnerID: number;
      participants: (user & {score?: number})[];
      result?: 'forfeit' | 'cancel' | 'tie' | 'empty';
    },
  ): round | undefined => {
    if (!round) return round;

    const winner = data.participants.find(p => p.id === data.winnerID);
    if (round.id === data.nextRoundID) {
      return {
        ...round,
        participants: winner ? [...round.participants, winner] : [],
        rounds:
          round.rounds?.map(r => updateRoundImmutably(r, data) || r) ?? [],
      };
    }

    if (round.id === data.roundID) {
      return {
        ...round,
        winnerID: data.winnerID,
        participants: data.participants,
        ...(data.result && {result: data.result}),
      };
    }

    if (round.rounds && round.rounds.length > 0) {
      const updatedRounds = round.rounds.map(
        r => updateRoundImmutably(r, data) || r,
      );

      if (updatedRounds.some((r, i) => r !== round.rounds[i])) {
        return {
          ...round,
          rounds: updatedRounds,
        };
      }
    }

    return round;
  };

  const updatedTournament = {
    ...joinedTournament,
    rounds: updateRoundImmutably(joinedTournament.rounds, data),
  };

  const winner = data.participants.find(p => p.id === data.winnerID);
  if (!data.nextRoundID && (!data.result || data.result !== 'empty')) {
    updatedTournament.winner = winner;
  }

  store.setState({joinedTournament: updatedTournament});
};

export const setupTournamentHandlers = () => {
  const websocket = Socket.getInstance();
  websocket.on('newTournament', handleNewTournament);
  websocket.on('tournamentJoined', handleTournamentJoined);
  websocket.on('participantJoin', handleParticipantJoin);
  websocket.on('participantLeft', handleParticipantLeft);
  websocket.on('tournamentStarted', handleTournamentStarted);
  websocket.on('tournamentMatchEnd', handleTournamentMatchEnd);
};
