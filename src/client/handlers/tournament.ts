import {round, user} from '../types';
import {Store} from '../services/store';
import {Toastify} from '../utils/toastify';
import {socket} from '../utils/websocket';

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
  result: 'cancel' | 'forfeit' | 'tie';
}) => {
  // pass
  console.log(data);
};

export const setupTournamentHandlers = () => {
  socket.on('newTournament', handleNewTournament);
  socket.on('tournamentJoined', handleTournamentJoined);
  socket.on('participantJoin', handleParticipantJoin);
  socket.on('participantLeft', handleParticipantLeft);
  socket.on('tournamentStarted', handleTournamentStarted);
  socket.on('tournamentMatchEnd', handleTournamentMatchEnd);
};
