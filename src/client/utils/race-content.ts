import {Keys, keys} from './keys';
import {Car} from '../containers/car';
import {Checkpoint} from '../containers/checkpoint';
import {Track} from '../containers/track';

export interface RaceGame {
  car1: Car;
  car2: Car;
  track: Track;
  gameStarted: boolean;
  keys: Keys;
  ctx: CanvasRenderingContext2D;
  canvasWidth: number;
  canvasHeight: number;
  announcement: HTMLElement;
  currentCheckpoint: Checkpoint;
  lastCheckpointTime: number;
  car1Score: number;
  car2Score: number;
}

export function initializeGame(
  ctx: CanvasRenderingContext2D,
  gameContainer: HTMLCanvasElement,
): RaceGame {
  // Set up game state
  const announcement = document.getElementById('announcement');
  if (!announcement) {
    throw new Error('Announcement element not found');
  }

  const currentCheckpoint = new Checkpoint(ctx);

  return {
    announcement,
    car1: new Car('Garry', ctx, 150, 150, '#FF0000'),
    car2: new Car('Bineta', ctx, 150, 200, '#0000FF'),
    track: new Track(ctx),
    gameStarted: false,
    keys: keys,
    ctx: ctx,
    canvasWidth: gameContainer.width,
    canvasHeight: gameContainer.height,
    currentCheckpoint,
    lastCheckpointTime: Date.now(),
    car1Score: 0,
    car2Score: 0,
  };
}

export function handleInput(game: RaceGame, onStart: () => void): void {
  const startButton = document.getElementById('race-btn');
  console.log('Found start button:', startButton);
  if (startButton) {
    startButton.addEventListener('click', () => {
      console.log('Button clicked!'); // Debug click event
      if (!game.gameStarted) {
        game.gameStarted = true;
        onStart(); // Call the callback to start game loop
      }
    });
  }

  // Handle keyboard input
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    // Car 1 controls (WASD)
    if (e.key === 'w' || e.key === 'W') game.keys.w = true;
    if (e.key === 'a' || e.key === 'A') game.keys.a = true;
    if (e.key === 'd' || e.key === 'D') game.keys.d = true;

    // Car 2 controls (Arrow Keys)
    if (e.key === 'ArrowUp') game.keys.ArrowUp = true;
    if (e.key === 'ArrowLeft') game.keys.ArrowLeft = true;
    if (e.key === 'ArrowRight') game.keys.ArrowRight = true;
  });

  document.addEventListener('keyup', (e: KeyboardEvent) => {
    // Car 1 controls (WASD)
    if (e.key === 'w' || e.key === 'W') game.keys.w = false;
    if (e.key === 'a' || e.key === 'A') game.keys.a = false;
    if (e.key === 'd' || e.key === 'D') game.keys.d = false;

    // Car 2 controls (Arrow Keys)
    if (e.key === 'ArrowUp') game.keys.ArrowUp = false;
    if (e.key === 'ArrowLeft') game.keys.ArrowLeft = false;
    if (e.key === 'ArrowRight') game.keys.ArrowRight = false;
  });
}
