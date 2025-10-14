import {Lobby} from '../pages/Lobby';
import {PongCanvas} from '../containers/pong/pongCanvas';
import {RaceCanvas} from '../containers/race/raceCanvas';
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
    sessionStorage.setItem('validRaceAccess', 'true');
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

const handleCarMove = (data: {
  playerId: number;
  timestamp: number;
  position: {
    x: number;
    y: number;
  };
  angle: number;
  speed: number;
}) => {
  const now = Date.now();
  const lag = now - data.timestamp;
  const raceCanvas = RaceCanvas.getInstance();

  if (lag < 100 && raceCanvas.race.opponent.car) {
    raceCanvas.race.opponent.car.x = data.position.x;
    raceCanvas.race.opponent.car.y = data.position.y;
    raceCanvas.race.opponent.car.angle = data.angle;
    raceCanvas.race.opponent.car.speed = data.speed;
  }
};

const handdleCarSlowdown = (data: {slowID: number}) => {
  const raceCanvas = RaceCanvas.getInstance();
  if (data.slowID === raceCanvas.race.opponent.id) {
    raceCanvas.race.opponent.car?.applySlowdown();
    console.log(raceCanvas.race.opponent.car?.color, 'got slowed down');
  }
};

export const setupGameHandlers = () => {
  socket.on('matchStart', handleMatchStart);
  socket.on('success', handleSuccess);
  socket.on('error', handleError);
  socket.on('paddleMove', handleMove);
  socket.on('matchCancel', handleMatchCancel);
  socket.on('matchEnd', handleMatchEnd);
  socket.on('round', handleRound);
  socket.on('ballState', handleBallState);
  socket.on('carMove', handleCarMove);
  socket.on('carSlowdown', handdleCarSlowdown);
};
