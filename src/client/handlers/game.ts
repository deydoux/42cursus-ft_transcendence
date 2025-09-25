import {Lobby} from '../containers/Lobby';
import {PongCanvas} from '../containers/pongCanvas';
import {Router} from '../services/router';
import {Store} from '../services/store';
import {Toastify} from '../utils/toastify';
import {socket} from '../utils/websocket';

export interface User {
  id: number;
  username: string;
  avatar: string;
  elo: number;
}

const handleMatchStart = (data: {
  game: string;
  ranked: boolean;
  players: [User, User];
  block: boolean;
}) => {
  const router = Router.getInstance();
  const store = Store.getInstance();

  store.setState({isOpponentBlocked: data.block});

  setTimeout(() => {
    const {user} = store.getState();
    const opponent = user && data.players.find(player => player.id !== user.id);
    if (opponent) Lobby.renderFoundOpponent(opponent);
  }, 50);

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

const handleMove = (data: {
  side: 'left' | 'right';
  direction: number;
  yPosition: number;
  timestamp: number;
}) => {
  PongCanvas.getInstance().handleOpponentPaddleMovement(data);
};

export const setupGameHandlers = () => {
  socket.on('matchStart', handleMatchStart);
  socket.on('success', handleSuccess);
  socket.on('error', handleError);
  socket.on('move', handleMove);
};
