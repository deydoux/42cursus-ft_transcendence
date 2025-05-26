import {Keys} from '../utils/content';
import {PongGame} from '../utils/content';
import {asciiArt} from '../utils/content';

export class PongCanvas {
  private ctx: CanvasRenderingContext2D;
  private gameContainer: HTMLCanvasElement;
  private pong: PongGame;
  private raf: number | null;

  constructor(gameContainer: HTMLCanvasElement, pong: PongGame) {
    this.gameContainer = gameContainer;
    this.ctx = pong.leftPaddle.ctx;
    this.pong = pong;
    this.raf = null;
  }

  public startGame(announcement: HTMLElement) {
    console.log('Start game called!');
    if (this.pong.gameStarted) return;
    console.log('Start game called & game starting...');
    this.pong.gameStarted = true;
    announcement.innerText =
      'Good luck ' +
      this.pong.leftPlayer +
      ' and ' +
      this.pong.rightPlayer +
      '!';
    this.raf = window.requestAnimationFrame(() =>
      this.draw(announcement, this.pong.keys, this.pong),
    );
  }

  public draw(announcement: HTMLElement, keys: Keys, pong: PongGame) {
    this.ctx.clearRect(
      0,
      0,
      this.gameContainer.width,
      this.gameContainer.height,
    );

    if (!pong.gameStarted) {
      this.displayStartMessage();
      return;
    }

    this.handlePaddleMovement(keys);
    pong.ball.draw();
    pong.leftPaddle.draw();
    pong.rightPaddle.draw();
    pong.ball.update(pong);

    if (pong.leftPlayerScore === 5 || pong.rightPlayerScore === 5) {
      const winner =
        pong.leftPlayerScore === 5 ? pong.leftPlayer : pong.rightPlayer;
      announcement.innerText = "And that's a win for " + winner + '!';
      if (this.raf) window.cancelAnimationFrame(this.raf);
      return;
    }

    this.raf = window.requestAnimationFrame(() =>
      this.draw(announcement, keys, pong),
    );
  }

  public displayStartMessage() {
    this.ctx.font = 'bold 32px monospace';
    this.ctx.fillStyle = 'white';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(
      'Press SPACE to start!',
      this.gameContainer.width / 2,
      70,
    );

    this.ctx.font = '16px monospace';
    const startY = this.gameContainer.height / 2 - (asciiArt.length * 20) / 2;
    for (let i = 0; i < asciiArt.length; i++) {
      this.ctx.fillText(
        asciiArt[i],
        this.gameContainer.width / 2,
        startY + i * 20,
      );
    }
  }

  public handlePaddleMovement(keys: Keys) {
    const paddleSpeed = 10;
    if (keys.w)
      this.pong.leftPaddle.move(-paddleSpeed, this.gameContainer.height);
    if (keys.s)
      this.pong.leftPaddle.move(paddleSpeed, this.gameContainer.height);
    if (keys.ArrowUp)
      this.pong.rightPaddle.move(-paddleSpeed, this.gameContainer.height);
    if (keys.ArrowDown)
      this.pong.rightPaddle.move(paddleSpeed, this.gameContainer.height);
  }
}
