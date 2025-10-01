import {Lobby} from '../pages/Lobby';
import {PongCanvas} from '../containers/pong/pongCanvas';
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
  dx: number;
  dy: number;
}) => {
  const router = Router.getInstance();
  const store = Store.getInstance();

  store.setState({
    isOpponentBlocked: data.block,
    players: data.players,
    matchStartBallData: {dx: data.dx, dy: data.dy},
  });

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

const handleMatchCancel = (data: {cause: string}) => {
  console.log('YIPPIE u cheated ...');
  const pongCanvas = PongCanvas.getInstance();
  Toastify.error(data.cause);
  pongCanvas.pong.gameStarted = false;
};

interface PongGameUIElement extends HTMLElement {
  showGameEndModal(data: {
    winner: number;
    result?: string;
    eloChange?: number;
  }): void;
}

const handleMatchEnd = (data: {
  winner: number;
  result?: string;
  eloChange?: number;
}) => {
  const pongCanvas = PongCanvas.getInstance();
  pongCanvas.pong.gameStarted = false;

  const gameUIElement = document.querySelector(
    '.pong-game-ui',
  ) as PongGameUIElement;
  if (gameUIElement && gameUIElement.showGameEndModal) {
    gameUIElement.showGameEndModal(data);
  }
};

const handleRound = (data: {dx: number; dy: number}) => {
  console.log('ROUND');
  const pongCanvas = PongCanvas.getInstance();
  if (pongCanvas && pongCanvas.pong && pongCanvas.pong.ball) {
    pongCanvas.pong.ball.setDirection(data.dx, data.dy);
  }
};
export const setupGameHandlers = () => {
  socket.on('matchStart', handleMatchStart);
  socket.on('success', handleSuccess);
  socket.on('error', handleError);
  socket.on('move', handleMove);
  socket.on('matchCancel', handleMatchCancel);
  socket.on('matchEnd', handleMatchEnd);
  socket.on('round', handleRound);
};
