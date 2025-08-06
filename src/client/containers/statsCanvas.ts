import {Ball} from './ball';
import {Paddle} from './paddle';
import race_bd from '../assets/race_track.png';

export class StatsCanvas {
  private ctx_race: CanvasRenderingContext2D;
  private ctx_pong: CanvasRenderingContext2D;
  public raf: number | null;

  constructor(
    ctx_race: CanvasRenderingContext2D,
    ctx_pong: CanvasRenderingContext2D,
  ) {
    this.ctx_pong = ctx_pong;
    this.ctx_race = ctx_race;
    this.raf = null;
  }

  loop(): void {
    this.raceBand();
    // this.pongBand();
    requestAnimationFrame(() => this.loop());
  }

  raceBand(): void {
    const img = new Image();
    img.onload = () => {
      // Calculate scaling to maintain aspect ratio
      const scale = Math.min(
        this.ctx_race.canvas.width / img.width,
        this.ctx_race.canvas.height / img.height,
      );

      // Calculate centered position
      const x = (this.ctx_race.canvas.width - img.width * scale) / 2;
      const y = (this.ctx_race.canvas.height - img.height * scale) / 2;

      // Clear canvas and draw scaled image
      this.ctx_race.clearRect(
        0,
        0,
        this.ctx_race.canvas.width,
        this.ctx_race.canvas.height,
      );
      this.ctx_race.drawImage(img, x, y, img.width * scale, img.height * scale);
    };
    img.onerror = () => console.error('Failed to load Hello Kitty image!');
    img.src = race_bd;
  }

  pongBand(): void {
    this.ctx_pong.clearRect(
      0,
      0,
      this.ctx_pong.canvas.width,
      this.ctx_pong.canvas.height,
    );
    const rightPaddle = new Paddle(this.ctx_pong, 10, 0);
    const leftPaddle = new Paddle(
      this.ctx_pong,
      this.ctx_pong.canvas.width - 10 - rightPaddle.width,
      0,
    );
    const ball = new Ball(this.ctx_pong);
    // Move the ball
    ball.x += ball.speed * ball.vx;
    ball.y += ball.speed * ball.vy;

    // Bounce off top and bottom
    if (ball.y <= 0 || ball.y >= this.ctx_pong.canvas.height - ball.radius) {
      ball.vy = -ball.vy;
    }

    // Paddle AI - simple following with slight delay
    rightPaddle.y += (ball.y - (rightPaddle.y + rightPaddle.height / 2)) * 0.1;
    leftPaddle.y += (ball.y - (leftPaddle.y + leftPaddle.height / 2)) * 0.1;

    // Keep paddles within canvas
    rightPaddle.y = Math.max(
      0,
      Math.min(this.ctx_pong.canvas.height - rightPaddle.height, rightPaddle.y),
    );
    leftPaddle.y = Math.max(
      0,
      Math.min(this.ctx_pong.canvas.height - leftPaddle.height, leftPaddle.y),
    );

    // Bounce off paddles
    if (ball.vx > 0) {
      // Moving right
      if (
        ball.x + ball.radius >= leftPaddle.x &&
        ball.y >= leftPaddle.y &&
        ball.y <= leftPaddle.y + leftPaddle.height
      ) {
        ball.vx = -ball.vx;
      }
    } else {
      // Moving left
      if (
        ball.x - ball.radius <= rightPaddle.x + rightPaddle.width &&
        ball.y >= rightPaddle.y &&
        ball.y <= rightPaddle.y + rightPaddle.height
      ) {
        ball.vx = -ball.vx;
      }
    }

    // Reset ball if it goes off screen
    if (ball.x < 0 || ball.x > this.ctx_pong.canvas.width) {
      ball.x = this.ctx_pong.canvas.width / 2;
      ball.y = this.ctx_pong.canvas.height / 2;
    }
    rightPaddle.draw();
    leftPaddle.draw();
    ball.draw();
  }
}
