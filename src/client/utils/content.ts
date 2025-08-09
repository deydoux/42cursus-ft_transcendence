import {Keys, keys} from './keys.ts';
import {Ball} from '../containers/ball.ts';
import {Paddle} from '../containers/paddle.ts';
import {Timer} from '../containers/timer.ts';

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
  leftPlayer: HTMLElement;
  rightPlayer: HTMLElement;
  leftPaddle: Paddle;
  rightPaddle: Paddle;
  ball: Ball;
  ctx: CanvasRenderingContext2D;
  leftPlayerScore: number;
  rightPlayerScore: number;
  leftPlayerScoreElement: HTMLElement;
  rightPlayerScoreElement: HTMLElement;
  keys: Keys;
  gameStarted: boolean;
  isScoring: boolean;
  timer: Timer;
}

export function initializeGame(ctx: CanvasRenderingContext2D): PongGame {
  const leftPlayer = document.getElementById('p1_name');
  const rightPlayer = document.getElementById('p2_name');
  const leftPlayerScoreElement = document.getElementById('p1_score');
  const rightPlayerScoreElement = document.getElementById('p2_score');
  const missingElements = [];
  if (!leftPlayer) missingElements.push('p1_name');
  if (!rightPlayer) missingElements.push('p2_name');
  if (!leftPlayerScoreElement) missingElements.push('p1_score');
  if (!rightPlayerScoreElement) missingElements.push('p2_score');
  if (missingElements.length > 0) {
    throw new Error(`Required HTML elements not found: ${missingElements.join(', ')}`);
  }
  leftPlayer.innerText = 'Player 1';
  rightPlayer.innerText = 'Player 2';
  const leftPaddle = new Paddle(
    ctx,
    10,
    (ctx.canvas.height - ctx.canvas.height * 0.25) / 2,
  );
  const rightPaddle = new Paddle(
    ctx,
    ctx.canvas.width - 10 - leftPaddle.width,
    (ctx.canvas.height - ctx.canvas.height * 0.25) / 2,
  );
  const ball = new Ball(ctx);

  return {
    leftPlayer,
    rightPlayer,
    leftPaddle,
    rightPaddle,
    ctx,
    ball,
    leftPlayerScoreElement,
    rightPlayerScoreElement,
    leftPlayerScore: 0,
    rightPlayerScore: 0,
    keys: {...keys},
    gameStarted: false,
    isScoring: false,
    timer: new Timer(),
  };
}

export function handleInput(pong: PongGame, onStart: () => void) {
  const startButton = document.getElementById('pong-btn');
  console.log('Found start button:', startButton);
  if (startButton) {
    startButton.addEventListener('click', () => {
      console.log('Button clicked!'); // Debug click event
      if (!pong.gameStarted) {
        pong.gameStarted = true;
        onStart(); // Call the callback to start game loop
      }
    });
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'w' || e.key === 'W') pong.keys.w = true;
    if (e.key === 's' || e.key === 'S') pong.keys.s = true;
    if (e.key === 'ArrowUp') pong.keys.ArrowUp = true;
    if (e.key === 'ArrowDown') pong.keys.ArrowDown = true;
  });

  document.addEventListener('keyup', e => {
    if (e.key === 'w' || e.key === 'W') pong.keys.w = false;
    if (e.key === 's' || e.key === 'S') pong.keys.s = false;
    if (e.key === 'ArrowUp') pong.keys.ArrowUp = false;
    if (e.key === 'ArrowDown') pong.keys.ArrowDown = false;
  });
}

/**
 * Displays a countdown message on the canvas
 * @param message The countdown message to display
 */
export function displayCountdownMessage(
  ctx: CanvasRenderingContext2D,
  color: string,
  message: string,
): void {
  ctx.save();

  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const baseFontSize = Math.max(width, height) * 0.08;

  // Center of canvas
  const centerX = width / 2;
  const centerY = height / 2;

  ctx.font = `bold ${baseFontSize}px monospace`;
  ctx.fillStyle = message === 'GO!' ? '#00ff00' : color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowBlur = 20;
  ctx.shadowColor =
    message === 'GO!' ? 'rgba(0, 0, 0, 0.8)' : 'rgba(41, 42, 43, 0.78)';

  ctx.fillText(message, centerX, centerY);

  ctx.restore();
}
