import {Keys, keys} from './keys';
import {Car} from '../containers/car';
import {Checkpoint} from '../containers/checkpoint';
import {Growpoint} from '../containers/growpoint';
import {Slowpoint} from '../containers/slowpoint';
import {Timer} from '../containers/timer';
import {Track} from '../containers/track';
import {Wall} from '../containers/wall';
import b_car from '../assets/bCar.png';
import g_car from '../assets/gCar.png';
import p_car from '../assets/pCar.png';
import r_car from '../assets/rCar.png';
import y_car from '../assets/yCar.png';

/**
 * Car sprites for the game
 */
export const carSprites = {
  r_car: r_car,
  y_car: y_car,
  b_car: b_car,
  p_car: p_car,
  g_car: g_car,
};

/**
 * Interface representing
 */
export interface RaceGame {
  car1: Car;
  car2: Car;
  track: Track;
  walls: Wall;
  timer: Timer;
  gameStarted: boolean;
  keys: Keys;
  ctx: CanvasRenderingContext2D;
  scores: HTMLElement;
  timerDisplay: HTMLElement;
  checkpoints: Checkpoint[];
  lastCheckpointTime: number | null;
  currentGrowpoint: Growpoint | null;
  lastGrowpointTime: number | null;
  currentSlowpoint: Slowpoint | null;
  lastSlowpointTime: number | null;
}

/**
 * Initializes the game state with the provided canvas context.
 * Sets up the track, cars, walls, checkpoints, and other game elements.
 * @param ctx The canvas rendering context
 * @returns The initialized RaceGame object
 */
export function initializeGame(ctx: CanvasRenderingContext2D): RaceGame {
  const scores = document.getElementById('scores');
  if (!scores) {
    throw new Error('scores element not found');
  }
  const timerDisplay = document.getElementById('timer');
  if (!timerDisplay) {
    throw new Error('timer element not found');
  }
  const walls = new Wall(ctx);
  walls.generateRandomWalls(20);
  const checkpoints = [Checkpoint.createRandomCheckpoint(ctx, walls, [])];

  return {
    scores,
    timerDisplay,
    car1: new Car(
      'Garry',
      ctx,
      ctx.canvas.width * 0.1,
      ctx.canvas.height * 0.1,
      '#ff0000',
      carSprites.r_car,
    ),
    car2: new Car(
      'Bineta',
      ctx,
      ctx.canvas.width * 0.9,
      ctx.canvas.height * 0.9,
      '#ffff00',
      carSprites.y_car,
    ),
    track: new Track(ctx),
    timer: new Timer(),
    walls,
    gameStarted: false,
    keys: keys,
    ctx: ctx,
    checkpoints,
    lastCheckpointTime: null,
    currentGrowpoint: null,
    lastGrowpointTime: null,
    currentSlowpoint: null,
    lastSlowpointTime: null,
  };
}

/**
 * Handles user input for starting the game and controlling the cars.
 * Binds click events to the start button and keyboard events for car controls.
 * @param race The RaceGame instance to control
 * @param onStart Callback function to start the game loop
 */
export function handleInput(race: RaceGame, onStart: () => void): void {
  const startButton = document.getElementById('race-btn');
  console.log('Found start button:', startButton);
  if (startButton) {
    startButton.addEventListener('click', () => {
      console.log('Button clicked!'); // Debug click event
      if (!race.gameStarted) {
        race.gameStarted = true;
        onStart(); // Call the callback to start game loop
      }
    });
  }

  // Handle keyboard input
  document.addEventListener('keydown', (e: KeyboardEvent) => {
    // Car 1 controls (WASD)
    if (e.key === 'w' || e.key === 'W') race.keys.w = true;
    if (e.key === 'a' || e.key === 'A') race.keys.a = true;
    if (e.key === 's' || e.key === 'S') race.keys.s = true;
    if (e.key === 'd' || e.key === 'D') race.keys.d = true;

    // Car 2 controls (Arrow Keys)
    if (e.key === 'ArrowUp') race.keys.ArrowUp = true;
    if (e.key === 'ArrowLeft') race.keys.ArrowLeft = true;
    if (e.key === 'ArrowDown') race.keys.ArrowDown = true;
    if (e.key === 'ArrowRight') race.keys.ArrowRight = true;
  });

  document.addEventListener('keyup', (e: KeyboardEvent) => {
    // Car 1 controls (WASD)
    if (e.key === 'w' || e.key === 'W') race.keys.w = false;
    if (e.key === 'a' || e.key === 'A') race.keys.a = false;
    if (e.key === 's' || e.key === 'S') race.keys.s = false;
    if (e.key === 'd' || e.key === 'D') race.keys.d = false;

    // Car 2 controls (Arrow Keys)
    if (e.key === 'ArrowUp') race.keys.ArrowUp = false;
    if (e.key === 'ArrowLeft') race.keys.ArrowLeft = false;
    if (e.key === 'ArrowDown') race.keys.ArrowDown = false;
    if (e.key === 'ArrowRight') race.keys.ArrowRight = false;
  });
}
