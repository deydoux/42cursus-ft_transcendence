import {Checkpoint} from '../containers/race/checkpoint';
import {Growpoint} from '../containers/race/growpoint';
import {Lobby} from '../pages/Lobby';
import {PongCanvas} from '../containers/pong/pongCanvas';
import {RaceCanvas} from '../containers/race/raceCanvas';
import {Router} from '../services/router';
import {Slowpoint} from '../containers/race/slowpoint';
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
  time: number;
  walls: [];
}) => {
  const router = Router.getInstance();
  const store = Store.getInstance();

  store.setState({
    isOpponentBlocked: data.block,
    game: {
      startTime: data.time,
      name: data.game,
      isLocal: false,
      players: data.players,
    },
    matchStartBallData: {dx: data.dx, dy: data.dy},
    raceWalls: data.walls,
  });

  setTimeout(() => {
    const {user} = store.getState();
    const opponent = user && data.players.find(player => player.id !== user.id);
    if (opponent) Lobby.renderFoundOpponent(opponent);
  }, 50);

  setTimeout(() => {
    store.setState({isWaitingForMatchmaking: false});
    sessionStorage.setItem('validGameAccess', 'true');
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

const handlePaddleMove = (data: {
  side: 'left' | 'right';
  direction: number;
  yPosition: number;
  timestamp: number;
}) => {
  const pongCanvas = PongCanvas.getInstance();

  if (pongCanvas.pong.player.side === data.side) {
    // pongCanvas shouldn't happen - we received our own movement
    return;
  } else if (pongCanvas.pong.opponent && pongCanvas.pong.opponent.paddle) {
    pongCanvas.pong.opponent.paddle.y = data.yPosition;
    // Optional: Add interpolation for smoother movement
    // targetPlayer.paddle.move(data.direction * (this.ctx.canvas.height * 0.01));
  }
};

const handleMatchCancel = (data: {cause: string}) => {
  const router = Router.getInstance();
  const {game} = Store.getInstance().getState();
  if (!game) throw new Error('failed to fetch game state');

  if (game.name == 'pong') {
    const pongCanvas = PongCanvas.getInstance();
    pongCanvas.resetPongGame();
  } else if (game.name == 'race') {
    const raceCanvas = RaceCanvas.getInstance();
    raceCanvas.resetCarGame();
  }
  Toastify.error(data.cause);
  router.navigate('/homepage');
};

const handleMatchEnd = (data: {
  winner: number;
  result?: string;
  eloChange?: number;
}) => {
  const {game} = Store.getInstance().getState();
  if (!game) throw new Error('failed to fetch game state');
  if (game.name == 'pong') {
    const pongCanvas = PongCanvas.getInstance();
    if (pongCanvas && pongCanvas.pong) {
      pongCanvas.endofAMatch(data.winner, data.result, data.eloChange, false);
    }
  }
  if (game.name == 'race') {
    const raceCanvas = RaceCanvas.getInstance();
    if (raceCanvas && raceCanvas.race) {
      raceCanvas.endofAMatch(data.winner, data.result, data.eloChange);
    }
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
  const raceCanvas = RaceCanvas.getInstance();
  if (data.playerId === raceCanvas.race.player.id) return;
  const now = Date.now();
  const lag = now - data.timestamp;

  if (lag < 100 && raceCanvas.race.opponent.car) {
    raceCanvas.race.opponent.car.x = data.position.x;
    raceCanvas.race.opponent.car.y = data.position.y;
    raceCanvas.race.opponent.car.angle = data.angle;
    raceCanvas.race.opponent.car.speed = data.speed;
  }
};

const handleCarSlowdown = (data: {slowID: number}) => {
  const raceCanvas = RaceCanvas.getInstance();
  if (data.slowID === raceCanvas.race.opponent.id) {
    raceCanvas.race.opponent.car?.applySlowdown();
    console.log(raceCanvas.race.opponent.username, ' got slowed down');
  }
};

const handlecarGrowth = (data: {growthID: number}) => {
  const raceCanvas = RaceCanvas.getInstance();
  if (data.growthID === raceCanvas.race.player.id) {
    raceCanvas.race.player.car?.applyCarGrowth();
    console.log(raceCanvas.race.player.username, ' got slowed down');
  }
};

const handleRaceObject = (data: {object: string; x: number; y: number}) => {
  const raceCanvas = RaceCanvas.getInstance();
  if (data.object === 'checkpoint')
    raceCanvas.race.checkpoints.push(
      new Checkpoint(raceCanvas.race.ctx, data.x, data.y),
    );
  if (data.object === 'slowpoint')
    raceCanvas.race.currentSlowpoint = new Slowpoint(
      raceCanvas.race.ctx,
      data.x,
      data.y,
    );
  if (data.object === 'growpoint')
    raceCanvas.race.currentGrowpoint = new Growpoint(
      raceCanvas.race.ctx,
      data.x,
      data.y,
    );
};

export const setupGameHandlers = () => {
  socket.on('matchStart', handleMatchStart);
  socket.on('success', handleSuccess);
  socket.on('error', handleError);
  socket.on('paddleMove', handlePaddleMove);
  socket.on('matchCancel', handleMatchCancel);
  socket.on('matchEnd', handleMatchEnd);
  socket.on('round', handleRound);
  socket.on('ballState', handleBallState);
  socket.on('carMove', handleCarMove);
  socket.on('carSlowdown', handleCarSlowdown);
  socket.on('carGrowth', handlecarGrowth);
  socket.on('raceObject', handleRaceObject);
};
