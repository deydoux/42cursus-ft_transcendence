import {Ball} from '../containers/pongCanvasObjects.ts';
import {Keys} from '../utils/content';
import {Paddle} from '../containers/pongCanvasObjects.ts';
import {PongGame} from '../utils/content';
import {asciiArt} from '../utils/content';

export class PongCanvas {
  private ctx: CanvasRenderingContext2D;
  private gameContainer: HTMLCanvasElement;
  private ball: Ball;
  private leftPaddle: Paddle;
  private rightPaddle: Paddle;
  private gameStarted: boolean;
  private raf: number | null;

  constructor(gameContainer: HTMLCanvasElement) {
    this.gameContainer = gameContainer;
    const ctx = gameContainer.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get 2D context from canvas element.');
    }
    this.ctx = ctx;
    this.ball = new Ball(this.ctx);
    this.leftPaddle = new Paddle(this.ctx, 10, 0);
    this.rightPaddle = new Paddle(
      this.ctx,
      gameContainer.width - 10 - this.leftPaddle.width,
      0,
    );
    this.gameStarted = false;
    this.raf = null;
  }

  public startGame(
    announcement: HTMLElement,
    leftPlayer: string,
    rightPlayer: string,
  ) {
    if (this.gameStarted) return;
    this.gameStarted = true;
    announcement.innerText =
      'Good luck ' + leftPlayer + ' and ' + rightPlayer + '!';
    this.raf = window.requestAnimationFrame(this.draw.bind(this));
  }

  public draw(announcement: HTMLElement, keys: Keys, pong: PongGame) {
    this.ctx.clearRect(
      0,
      0,
      this.gameContainer.width,
      this.gameContainer.height,
    );

    if (!this.gameStarted) {
      this.displayStartMessage();
      return;
    }

    this.handlePaddleMovement(keys);
    this.ball.draw();
    this.leftPaddle.draw();
    this.rightPaddle.draw();
    this.ball.update(pong);

    if (pong.leftPlayerScore === 5 || pong.rightPlayerScore === 5) {
      const winner =
        pong.leftPlayerScore === 5 ? pong.leftPlayer : pong.rightPlayer;
      announcement.innerText = "And that's a win for " + winner + '!';
      if (this.raf) window.cancelAnimationFrame(this.raf);
      return;
    }

    this.raf = window.requestAnimationFrame(
      this.draw.bind(this, announcement, keys, pong),
    );
  }

  private displayStartMessage() {
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

  private handlePaddleMovement(keys: Keys) {
    const paddleSpeed = 10;
    if (keys.w) this.leftPaddle.move(-paddleSpeed, this.gameContainer.height);
    if (keys.s) this.leftPaddle.move(paddleSpeed, this.gameContainer.height);
    if (keys.ArrowUp)
      this.rightPaddle.move(-paddleSpeed, this.gameContainer.height);
    if (keys.ArrowDown)
      this.rightPaddle.move(paddleSpeed, this.gameContainer.height);
  }
}
