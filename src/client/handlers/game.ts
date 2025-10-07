import {Router} from '../services/router';
import {Store} from '../services/store';
import {Toastify} from '../utils/toastify';
import {socket} from '../utils/websocket';

const handleMatchStart = (data: {
  game: string;
  ranked: boolean;
  players: [
    {
      id: number;
      username: string;
      avatar: string;
      elo: number;
    },
    {
      id: number;
      username: string;
      avatar: string;
      elo: number;
    },
  ];
}) => {
  const router = Router.getInstance();
  const store = Store.getInstance();

  store.setState({isWaitingForMatchmaking: false});
  router.navigate(`/${data.game}`);
};

const handleSuccess = (data: {origin: string}) => {
  const router = Router.getInstance();
  const store = Store.getInstance();

  if (data.origin === 'joinMatchmaking') {
    store.setState({isWaitingForMatchmaking: true});
    router.navigate('/lobby');
  } else if (data.origin === 'createTournament') {
    Toastify.success('Tournament created successfully!');
    store.setState({tournamentView: 'lobby'});
  }
};

const handleError = (data: {message: string}) => {
  if (data.message) Toastify.error(data.message);
};

export const setupGameHandlers = () => {
  socket.on('matchStart', handleMatchStart);
  socket.on('success', handleSuccess);
  socket.on('error', handleError);
};
