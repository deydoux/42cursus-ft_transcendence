export class Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  ctx: CanvasRenderingContext2D;

  constructor(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    vx = 5,
    vy = 2,
    color = 'white',
  ) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
    this.color = color;
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
    this.ctx.closePath();
    this.ctx.fillStyle = this.color;
    this.ctx.fill();
  }

  update(pong) {
    this.x += this.vx;
    this.y += this.vy;

    // Wall collision (top/bottom)
    if (this.y - this.radius < 0 || this.y + this.radius > pong.canvasHeight) {
      this.vy = -this.vy;
    }

    // Left paddle collision
    if (
      this.x - this.radius < pong.leftPaddle.x + pong.leftPaddle.width &&
      this.y > pong.leftPaddle.y &&
      this.y < pong.leftPaddle.y + pong.leftPaddle.height
    ) {
      this.vx = -this.vx;
      this.x = pong.leftPaddle.x + pong.leftPaddle.width + this.radius;
    }

    // Right paddle collision
    if (
      this.x + this.radius > pong.rightPaddle.x &&
      this.y > pong.rightPaddle.y &&
      this.y < pong.rightPaddle.y + pong.rightPaddle.height
    ) {
      this.vx = -this.vx;
      this.x = pong.rightPaddle.x - this.radius;
    }

    // Ball out of bounds (left or right wall)
    if (this.x - this.radius < 0) {
      // Ball went past the left wall
      this.x = pong.canvasWidth / 2;
      this.y = pong.canvasHeight / 2;
      this.vx = Math.abs(this.vx); // Ensure it goes right
      pong.rightPlayerScore++;
      pong.rightPlayerScoreElement.innerText = pong.rightPlayerScore;
      pong.announcement.innerText = pong.rightPlayer + ' scores!';
      //TODO: Add animation for announcement
      // pong.announcement.classList.add('animate');
      // setTimeout(() => {
      //   pong.announcement.classList.remove('animate');
      // }, 2000); // Remove animation after 2 seconds
      // return;
    }
    if (this.x + this.radius > pong.canvasWidth) {
      // Ball went past the right wall
      this.x = pong.canvasWidth / 2;
      this.y = pong.canvasHeight / 2;
      this.vx = -Math.abs(this.vx); // Ensure it goes left
      pong.leftPlayerScore++;
      pong.leftPlayerScoreElement.innerText = pong.leftPlayerScore;
      pong.announcement.innerText = pong.leftPlayer + ' scores!';
    }
  }
}

export class Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  ctx: CanvasRenderingContext2D;

  constructor(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width: number,
    height: number,
    color = 'white',
  ) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
  }

  draw() {
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(this.x, this.y, this.width, this.height);
  }

  move(dy: number, canvasHeight: number) {
    this.y = Math.max(0, Math.min(canvasHeight - this.height, this.y + dy));
  }
}
