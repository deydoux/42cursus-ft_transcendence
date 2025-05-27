import {Ball, Paddle} from '../containers/pongCanvasObjects.ts';

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

export const keys = {
  w: false,
  s: false,
  ArrowUp: false,
  ArrowDown: false,
};

export type Keys = typeof keys;

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
  announcement: HTMLElement | null;
  leftPlayer: string | null;
  rightPlayer: string | null;
  canvasWidth: number;
  canvasHeight: number;
  leftPaddle: Paddle;
  rightPaddle: Paddle;
  ball: Ball;
  leftPlayerScore: number;
  rightPlayerScore: number;
  leftPlayerScoreElement: HTMLElement | null;
  rightPlayerScoreElement: HTMLElement | null;
  keys: Keys;
  gameStarted: boolean;
}

export function initializeGame(
  ctx: CanvasRenderingContext2D,
  gameContainer: HTMLCanvasElement,
  leftPlayer: string | null,
  rightPlayer: string | null,
  leftPlayerScoreElement: HTMLElement | null,
  rightPlayerScoreElement: HTMLElement | null,
): PongGame {
  const leftPaddle = new Paddle(
    ctx,
    10,
    0,
    gameContainer.width * 0.01,
    gameContainer.height * 0.15,
  );
  const rightPaddle = new Paddle(
    ctx,
    gameContainer.width - 10 - leftPaddle.width,
    0,
    gameContainer.width * 0.01,
    gameContainer.height * 0.15,
  );
  const ball = new Ball(
    ctx,
    gameContainer.width / 2,
    gameContainer.height / 2,
    gameContainer.width * 0.01,
  );

  return {
    announcement: document.getElementById('announcement'),
    leftPlayer,
    rightPlayer,
    canvasWidth: gameContainer.width,
    canvasHeight: gameContainer.height,
    leftPaddle,
    rightPaddle,
    ball: ball,
    leftPlayerScore: 0,
    rightPlayerScore: 0,
    leftPlayerScoreElement,
    rightPlayerScoreElement,
    keys: {...keys},
    gameStarted: false,
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
