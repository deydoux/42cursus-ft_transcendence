import '../styles/game.css';
import {PongGame, initializeGame} from '../utils/content';
import {Announcement} from '../containers/announcement';
import {asciiArt} from '../utils/content';
import {handleInput} from '../utils/content';
import {html} from '../utils/html';
import {renderPong} from '../containers/PongGame';

export function renderPongPage(): void {
  const right = document.getElementById('right-container');
  const left = document.getElementById('left-container');
  if (!(right && left))
    return console.error('Could not find right and left containers');

  left.className = 'flex-1 h-full rounded-[30px] border';
  right.className =
    'w-[550px] flex-none h-full flex flex-col gap-5 items-center';
  left.appendChild(renderPong());
  right.appendChild(
    html`<div class="w-full flex-1 rounded-[30px] border"></div>`,
  );
  right.appendChild(
    html`<div class="h-14 w-full flex-none rounded-[30px] border"></div>`,
  );

  const gameContainer = document.getElementById('pong') as HTMLCanvasElement;
  const rect = gameContainer.getBoundingClientRect();
  const ctx = gameContainer?.getContext('2d');
  if (!ctx) {
    console.error('Could not get canvas context');
    return;
  }
  const dpr = window.devicePixelRatio || 1;
  gameContainer.width = rect.width * dpr;
  gameContainer.height = rect.height * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // TODO: Replace with reel player class
  const leftPlayer = 'Player 1';
  const rightPlayer = 'Player 2';
  const leftPlayerScoreElement = document.getElementById('leftPlayerScore');
  const rightPlayerScoreElement = document.getElementById('rightPlayerScore');
  if (!leftPlayerScoreElement || !rightPlayerScoreElement) {
    console.error('Could not find score elements');
    return;
  }

  const game: PongGame = initializeGame(
    ctx,
    gameContainer,
    leftPlayer,
    rightPlayer,
    leftPlayerScoreElement,
    rightPlayerScoreElement,
  );
  const raf = 0;
  const rafRef = {raf};

  function draw() {
    if (!ctx) {
      console.error('Canvas context is null');
      return;
    }
    ctx.clearRect(0, 0, gameContainer.width, gameContainer.height);

    if (!game.gameStarted) {
      ctx.font = 'bold 32px monospace';
      ctx.fillStyle = 'white';
      ctx.textAlign = 'center';
      ctx.fillText('Press SPACE to start!', gameContainer.width / 2, 70);

      ctx.font = '16px monospace';
      const startY = gameContainer.height / 2 - (asciiArt.length * 20) / 2;
      for (let i = 0; i < asciiArt.length; i++) {
        ctx.fillText(asciiArt[i], gameContainer.width / 2, startY + i * 20);
      }
      return;
    }

    // Move paddles based on keys
    const paddleSpeed = 10;
    if (game.keys.w) game.leftPaddle.move(-paddleSpeed, game.canvasHeight);
    if (game.keys.s) game.leftPaddle.move(paddleSpeed, game.canvasHeight);
    if (game.keys.ArrowUp)
      game.rightPaddle.move(-paddleSpeed, game.canvasHeight);
    if (game.keys.ArrowDown)
      game.rightPaddle.move(paddleSpeed, game.canvasHeight);

    game.ball.draw();
    game.leftPaddle.draw();
    game.rightPaddle.draw();
    game.ball.update(game);

    if (game.leftPlayerScore === 5 || game.rightPlayerScore === 5) {
      const winner =
        game.leftPlayerScore === 5 ? game.leftPlayer : game.rightPlayer;
      if (game.announcement) {
        const announce = new Announcement(game.announcement);
        announce.displayMessage("And that's a win for " + winner + '!');
        if (rafRef.raf) window.cancelAnimationFrame(rafRef.raf);
        return;
      }
    }

    rafRef.raf = window.requestAnimationFrame(draw);
  }
  handleInput(game, draw, rafRef);
  draw();
}
