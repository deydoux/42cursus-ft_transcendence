// import {Lobby} from '../pages/Lobby';
import {PongCanvas} from '../containers/pong/pongCanvas';
import {Router} from '../services/router';
import {Socket} from '../services/websocket';
import {Store} from '../services/store';
import {Toastify} from '../utils/toastify';

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

  // setTimeout(() => {
  //   const {user} = store.getState();
  //   const opponent = user && data.players.find(player => player.id !== user.id);
  //   if (opponent) Lobby.renderFoundOpponent(opponent);
  // }, 50);

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
  } else if (data.origin === 'createTournament') {
    Toastify.success('Tournament created successfully!');
    store.setState({tournamentView: 'lobby'});
  } else if (data.origin === 'kickParticipant') {
    Toastify.error('You were kicked from tournament');
    store.setState({
      tournamentView: 'tournaments',
      joinedTournament: undefined,
    });
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
  const pongCanvas = PongCanvas.getInstance();
  const router = Router.getInstance();
  Toastify.error(data.cause);
  pongCanvas.resetPongGame();
  router.navigate('/homepage');
};

const handleMatchEnd = (data: {
  winner: number;
  result?: string;
  eloChange?: number;
}) => {
  const pongCanvas = PongCanvas.getInstance();
  if (pongCanvas && pongCanvas.pong) {
    pongCanvas.endofAMatch(data.winner, data.result, data.eloChange, false);
  }
};

const handleRound = (data: {dx: number; dy: number}) => {
  const pongCanvas = PongCanvas.getInstance();
  if (pongCanvas && pongCanvas.pong && pongCanvas.pong.ball) {
    pongCanvas.pong.ball.setDirection(data.dx, data.dy);
  }
};

const handleBallState = (data: {
  x: number;
  y: number;
  vx: number;
  vy: number;
  speed: number;
  timestamp: number;
  side: 'left' | 'right';
}) => {
  const pongCanvas = PongCanvas.getInstance();
  if (pongCanvas && pongCanvas.pong) {
    pongCanvas.pong.ball.receiveBallState(data);
  }
};

export const setupGameHandlers = () => {
  const websocket = Socket.getInstance();
  websocket.on('matchStart', handleMatchStart);
  websocket.on('success', handleSuccess);
  websocket.on('error', handleError);
  websocket.on('move', handleMove);
  websocket.on('matchCancel', handleMatchCancel);
  websocket.on('matchEnd', handleMatchEnd);
  websocket.on('round', handleRound);
  websocket.on('ballState', handleBallState);
};
