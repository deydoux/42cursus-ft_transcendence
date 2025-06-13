import '../styles/race-page.css';
import {handleInput, initializeGame} from '../utils/race-content';
import {RaceCanvas} from '../containers/raceCanvas';
import {html} from '../utils/html';
import {renderCar} from '../containers/raceGame';

export function renderRacePage(): void {
  const right = document.getElementById('right-container');
  const left = document.getElementById('left-container');
  if (!(right && left))
    return console.error('Could not find right and left containers');

  left.className = 'flex-1 h-full';
  right.className =
    'w-[500px] flex-none h-full flex flex-col gap-5 items-center';
  left.appendChild(renderCar());
  right.appendChild(
    html`<div class="w-full flex-1 rounded-[30px] border"></div>`,
  );
  right.appendChild(
    html`<div class="h-14 w-full flex-none rounded-[30px] border"></div>`,
  );

  // Get canvas and setup context
  const gameContainer = document.getElementById('race') as HTMLCanvasElement;
  if (!gameContainer) {
    console.error('Could not find canvas element');
    return;
  }

  // Setup canvas with proper DPR scaling
  const rect = gameContainer.getBoundingClientRect();
  const ctx = gameContainer.getContext('2d');
  if (!ctx) {
    console.error('Could not get canvas context');
    return;
  }
  const dpr = window.devicePixelRatio || 1;
  gameContainer.width = rect.width * dpr;
  gameContainer.height = rect.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.imageSmoothingEnabled = true;

  // Initialize game state
  const race = initializeGame(ctx, gameContainer);

  // Create canvas controller
  const raceCanvas = new RaceCanvas(gameContainer, race);

  // Show start message
  raceCanvas.displayStartMessage();

  console.log('Setting up input handling...');

  handleInput(race, () => {
    console.log('handleinput triggered');
    console.log('Game started status:', race.gameStarted);
    raceCanvas.startGame();
  });
}
