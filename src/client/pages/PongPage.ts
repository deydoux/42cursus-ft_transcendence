import '../styles/pong-page.css';
import {handleInput, initializeGame} from '../utils/content';
import {PongCanvas} from '../containers/pongCanvas';
import {html} from '../utils/html';
import {renderPong} from '../containers/renderPong';

/**
 * Renders the Pong game page by setting up the layout and initializing the game.
 * It creates the left and right containers, appends the Pong game canvas,
 * and sets up the game context with the necessary dimensions and styles.
 */
export function renderPongPage(): void {
  const right = document.getElementById('right-container');
  const left = document.getElementById('left-container');
  if (!(right && left))
    return console.error('Could not find right and left containers');

  left.className = 'flex-1 h-full';
  right.className =
    'w-[500px] flex-none h-full flex flex-col gap-5 items-center';
  left.appendChild(renderPong());
  right.appendChild(
    html`<div class="w-full flex-1 rounded-[30px] border"></div>`,
  );
  right.appendChild(
    html`<div class="h-14 w-full flex-none rounded-[30px] border"></div>`,
  );

  const gameContainer = document.getElementById('pong') as HTMLCanvasElement;
  if (!gameContainer) {
    console.error('Could not find canvas element');
    return;
  }

  const ctx = gameContainer.getContext('2d');
  if (!ctx) {
    console.error('Could not get canvas context');
    return;
  }
  gameContainer.width = 1920;
  gameContainer.height = 1080;
  ctx.imageSmoothingEnabled = true;

  const pong = initializeGame(ctx, 'Player 1', 'Player 2');

  const pongCanvas = new PongCanvas(pong);

  pongCanvas.displayStartMessage();

  handleInput(pong, () => {
    pongCanvas.startGame();
  });
}
