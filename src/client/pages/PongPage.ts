import '../styles/pong-page.css';
import {handleInput, initializeGame} from '../utils/content';
import {PongCanvas} from '../containers/pongCanvas';
import {html} from '../utils/html';
import {renderPong} from '../containers/pongGame';

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

  const pong = initializeGame(
    ctx,
    gameContainer,
    'Player 1',
    'Player 2',
    document.getElementById('leftPlayerScore'),
    document.getElementById('rightPlayerScore'),
  );

  const pongCanvas = new PongCanvas(gameContainer, pong);

  pongCanvas.displayStartMessage();

  handleInput(pong, () => {
    pongCanvas.startGame();
  });
}

//TODO: change gameContainer to ctx.canvas (it's the same)
