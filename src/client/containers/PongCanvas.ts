import {Keys} from '../utils/content';
import {PongGame} from '../utils/content';
import {asciiArt} from '../utils/content';

export class PongCanvas {
  private ctx: CanvasRenderingContext2D;
  private gameContainer: HTMLCanvasElement;
  private pong: PongGame;
  private raf: number | null;
  private dpr: number;

  constructor(gameContainer: HTMLCanvasElement, pong: PongGame) {
    this.gameContainer = gameContainer;
    this.ctx = pong.leftPaddle.ctx;
    this.pong = pong;
    this.raf = null;
    this.dpr = window.devicePixelRatio || 1;
  }

  public startGame(announcement: HTMLElement) {
    console.log('Start game called!');
    if (this.pong.gameStarted) return;
    console.log('Start game called & game starting...');
    this.pong.gameStarted = true;
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
      this.displayStartMessage(announcement);
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

  public displayStartMessage(announcement: HTMLElement) {
    announcement.innerText =
      'Good luck ' +
      this.pong.leftPlayer +
      ' and ' +
      this.pong.rightPlayer +
      '!';

    this.ctx.save();
    this.ctx.translate(this.gameContainer.width / 2, 70 * this.dpr);
    this.ctx.font = `bold ${32 * this.dpr}px monospace`;
    this.ctx.fillStyle = 'white';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('Press SPACE to start!', 0, 0);

    this.ctx.font = `${16 * this.dpr}px monospace`;
    const lineHeight = 20 * this.dpr;
    const startY = 60 * this.dpr;
    for (let i = 0; i < asciiArt.length; i++) {
      this.ctx.fillText(asciiArt[i], 0, startY + i * lineHeight);
    }
    this.ctx.restore();
  }

  public handlePaddleMovement(keys: Keys) {
    const paddleSpeed = this.gameContainer.height * 0.01;
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
