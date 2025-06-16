import {Ball, Paddle} from '../containers/pongCanvasObjects.ts';
import {Keys, keys} from './keys.ts';

export const welcomeEmojis = [
  '👋',
  '🤌',
  '🙏',
  '🙌',
  '🎉',
  '💐',
  '🏓',
  '🌞',
  '🎮',
  '👾',
  '🕹️',
  '🎀',
  '🌸',
  '🔫',
  '🍑',
];

export const asciiArt = [
  '⠀⠀⠀⠀⠀⠀⠀⢀⣀⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣤⣤⣀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⡀⣰⡿⠛⠛⠿⢶⣦⣀⠀⢀⣀⣀⣀⣀⣀⣀⣠⡾⠋⠀⠀⠹⣷⣄⣤⣶⡶⠿⠿⣷⡄⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⢰⣿⠁⠀⠀⠀⠀⠈⠙⠛⠛⠋⠉⠉⢹⡟⠁⠀⠀⣀⣀⠘⣿⠉⠀⠀⠀⠀⠘⣿⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⢸⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⠁⠀⠀⣾⡋⣽⠿⠛⠿⢶⣤⣤⣤⣤⣿⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⣰⡿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠙⠛⠛⠛⠙⢷⣄⣀⣀⣼⣏⣿⠀⠀⢀⣿⠀⠀⠀⠀',
  '⠀⠀⠀⠀⢸⡟⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠙⣿⡉⠉⠁⢀⣠⣿⡇⠀⠀⠀⠀',
  '⠀⠀⠀⠀⣿⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠛⠗⠾⠟⠋⢹⣷⠀⠀⠀⠀',
  '⢀⣤⣤⣤⣿⣤⣄⠀⠀⠀⠴⠚⠲⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣶⡆⠀⠀⠀⠀⢀⣈⣿⣀⣀⡀⠀',
  '⠀⠀⠀⠈⣿⣠⣾⠟⠛⢷⡄⠀⠀⠀⠀⠀⠀⠀⡤⠶⢦⡀⠀⠀⠀⠀⠹⠯⠃⠀⠀⠀⠈⠉⢩⡿⠉⠉⠉⠁',
  '⠀⠀⣤⡶⠿⣿⣇⠀⠀⠸⣷⠀⠀⠀⠀⠀⠀⠀⠓⠶⠞⠃⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢤⣼⣯⣀⣀⠀⠀',
  '⠀⢰⣯⠀⠀⠈⠻⠀⠀⠀⣿⣶⣤⣄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⡿⠁⠉⠉⠁⢀',
  '⠀⠀⠙⣷⣄⠀⠀⠀⠀⠀⢀⣀⣀⠙⢿⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢈⣿⡿⢷⣄⡀⠀⠀⠀',
  '⠀⠀⠀⠈⠙⣷⠀⠀⠀⣴⠟⠉⠉⠀⠀⣿⣀⣀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣀⣠⣤⣾⠟⠉⠀⠀⠈⠉⠀⠀⠀',
  '⠀⠀⠀⠀⠰⣿⠀⠀⠀⠙⢧⣤⡶⠟⢀⣿⠛⢟⡟⡯⠽⢶⡶⠾⢿⣻⣏⣹⡏⣁⡿⠀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠹⣷⣄⠀⠀⠀⠀⠀⣠⣾⠏⠀⠀⠙⠛⠛⠋⠀⠀⢀⣽⠟⠛⠖⠛⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠙⠻⠷⠶⠿⠟⠋⠹⣷⣤⣀⡀⠄⣡⣀⣠⣴⡿⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠳⣍⣉⣻⣏⣉⣡⠞⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
  '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀',
];

export interface PongGame {
  announcement: HTMLElement;
  leftPlayer: string | null;
  rightPlayer: string | null;
  leftPaddle: Paddle;
  rightPaddle: Paddle;
  ball: Ball;
  ctx: CanvasRenderingContext2D;
  leftPlayerScore: number;
  rightPlayerScore: number;
  leftPlayerScoreElement: HTMLElement | null;
  rightPlayerScoreElement: HTMLElement | null;
  keys: Keys;
  gameStarted: boolean;
  isScoring: boolean;
}

export function initializeGame(
  ctx: CanvasRenderingContext2D,
  leftPlayer: string | null,
  rightPlayer: string | null,
  leftPlayerScoreElement: HTMLElement | null,
  rightPlayerScoreElement: HTMLElement | null,
): PongGame {
  const announcement = document.getElementById('announcement');
  if (!announcement) {
    throw new Error('Announcement element not found');
  }
  const leftPaddle = new Paddle(ctx, 10, 0);
  const rightPaddle = new Paddle(
    ctx,
    ctx.canvas.width - 10 - leftPaddle.width,
    0,
  );
  const ball = new Ball(ctx);

  return {
    announcement,
    leftPlayer,
    rightPlayer,
    leftPaddle,
    rightPaddle,
    ctx,
    ball,
    leftPlayerScore: 0,
    rightPlayerScore: 0,
    leftPlayerScoreElement,
    rightPlayerScoreElement,
    keys: {...keys},
    gameStarted: false,
    isScoring: false,
  };
}

export function updateScores(pong: PongGame) {
  if (pong.leftPlayerScoreElement) {
    pong.leftPlayerScoreElement.innerText = pong.leftPlayerScore.toString();
  }
  if (pong.rightPlayerScoreElement) {
    pong.rightPlayerScoreElement.innerText = pong.rightPlayerScore.toString();
  }
}

export function announceWinner(pong: PongGame) {
  const winner =
    pong.leftPlayerScore === 5 ? pong.leftPlayer : pong.rightPlayer;
  if (pong.announcement) {
    pong.announcement.innerText = "And that's a win for " + winner + '!';
  }
}

export function handleInput(game: PongGame, onStart: () => void) {
  document.addEventListener('keydown', e => {
    if (e.code === 'Space' || e.key === ' ') {
      console.log('Space pressed!');
      onStart();
    }
    if (e.key === 'w' || e.key === 'W') game.keys.w = true;
    if (e.key === 's' || e.key === 'S') game.keys.s = true;
    if (e.key === 'ArrowUp') game.keys.ArrowUp = true;
    if (e.key === 'ArrowDown') game.keys.ArrowDown = true;
  });

  document.addEventListener('keyup', e => {
    if (e.key === 'w' || e.key === 'W') game.keys.w = false;
    if (e.key === 's' || e.key === 'S') game.keys.s = false;
    if (e.key === 'ArrowUp') game.keys.ArrowUp = false;
    if (e.key === 'ArrowDown') game.keys.ArrowDown = false;
  });
}

export function resetPongGame(pong: PongGame) {
  pong.leftPlayerScore = 0;
  pong.rightPlayerScore = 0;
  updateScores(pong);

  // Reset ball position and velocity
  pong.ball.x = pong.ctx.canvas.width / 2;
  pong.ball.y = pong.ctx.canvas.height / 2;
  pong.ball.vx = pong.ctx.canvas.height * 0.006;
  pong.ball.vy = pong.ctx.canvas.width * 0.004;

  // Reset paddles
  pong.leftPaddle.y = 0;
  pong.rightPaddle.y = 0;

  pong.gameStarted = false;
}
