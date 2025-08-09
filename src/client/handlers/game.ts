import {Lobby} from '../containers/Lobby';
import {Router} from '../services/router';
import {Store} from '../services/store';
import {Toastify} from '../utils/toastify';
import {socket} from '../utils/websocket';

const handleMatchStart = (data: {
  game: string;
  opponent: {username: string};
}) => {
  const router = Router.getInstance();
  const store = Store.getInstance();

  Lobby.renderFoundOpponent(data.opponent);

  setTimeout(() => {
    store.setState({isWaitingForMatchmaking: false});
    router.navigate(`/${data.game}`);
  }, 3000);
};

const handleSuccess = (data: {origin: string}) => {
  const router = Router.getInstance();
  const store = Store.getInstance();

  if (data.origin === 'joinMatchmaking') {
    store.setState({isWaitingForMatchmaking: true});
    router.navigate('/lobby');
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
