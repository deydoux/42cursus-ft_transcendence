import {Keys, keys} from './keys';
import {Car} from '../containers/car';
import {Checkpoint} from '../containers/checkpoint';
import {Growpoint} from '../containers/growpoint';
import {Slowpoint} from '../containers/slowpoint';
import {Timer} from '../containers/timer';
import {Track} from '../containers/track';
import {Wall} from '../containers/wall';

export interface RaceGame {
  car1: Car;
  car2: Car;
  track: Track;
  walls: Wall;
  timer: Timer;
  gameStarted: boolean;
  keys: Keys;
  ctx: CanvasRenderingContext2D;
  announcement: HTMLElement;
  currentCheckpoint: Checkpoint | null;
  lastCheckpointTime: number;
  currentGrowpoint: Growpoint | null;
  lastGrowpointTime: number;
  currentSlowpoint: Slowpoint | null;
  lastSlowpointTime: number;
  car1Score: number;
  car2Score: number;
}

export function initializeGame(ctx: CanvasRenderingContext2D): RaceGame {
  // Set up game state
  const announcement = document.getElementById('announcement');
  if (!announcement) {
    throw new Error('Announcement element not found');
  }

  const walls = new Wall(ctx);
  walls.generateRandomWalls(10); // Generate 10 random walls
  const currentCheckpoint = Checkpoint.createRandomCheckpoint(ctx, walls);

  return {
    announcement,
    car1: new Car('Garry', ctx, 150, 150, '#FF0000'),
    car2: new Car('Bineta', ctx, 150, 200, '#0000FF'),
    track: new Track(ctx),
    timer: new Timer(),
    walls,
    gameStarted: false,
    keys: keys,
    ctx: ctx,
    currentCheckpoint,
    lastCheckpointTime: Date.now(),
    currentGrowpoint: null,
    lastGrowpointTime: Date.now(),
    currentSlowpoint: null,
    lastSlowpointTime: Date.now(),
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
    if (e.key === 's' || e.key === 'S') game.keys.s = true;
    if (e.key === 'd' || e.key === 'D') game.keys.d = true;

    // Car 2 controls (Arrow Keys)
    if (e.key === 'ArrowUp') game.keys.ArrowUp = true;
    if (e.key === 'ArrowLeft') game.keys.ArrowLeft = true;
    if (e.key === 'ArrowDown') game.keys.ArrowDown = true;
    if (e.key === 'ArrowRight') game.keys.ArrowRight = true;
  });

  document.addEventListener('keyup', (e: KeyboardEvent) => {
    // Car 1 controls (WASD)
    if (e.key === 'w' || e.key === 'W') game.keys.w = false;
    if (e.key === 'a' || e.key === 'A') game.keys.a = false;
    if (e.key === 's' || e.key === 'S') game.keys.s = false;
    if (e.key === 'd' || e.key === 'D') game.keys.d = false;

    // Car 2 controls (Arrow Keys)
    if (e.key === 'ArrowUp') game.keys.ArrowUp = false;
    if (e.key === 'ArrowLeft') game.keys.ArrowLeft = false;
    if (e.key === 'ArrowDown') game.keys.ArrowDown = false;
    if (e.key === 'ArrowRight') game.keys.ArrowRight = false;
  });
}
