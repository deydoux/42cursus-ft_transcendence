import hk_ball from '../assets/hk_ball.jpg';

export class Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  speed: number;
  maxSpeed: number;
  ctx: CanvasRenderingContext2D;
  isScoring: boolean;

  constructor(
    ctx: CanvasRenderingContext2D,
    x = ctx.canvas.width / 2,
    y = ctx.canvas.height / 2,
    vx = ctx.canvas.width * 0.003,
    vy = ctx.canvas.height * 0.002,
    radius = ctx.canvas.width * 0.012,
    color = 'white',
    speed = Math.sqrt(vx * vx + vy * vy),
    maxSpeed = Math.max(ctx.canvas.width, ctx.canvas.height) * 0.012,
    isScoring = false,
  ) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
    this.color = color;
    this.speed = speed;
    this.maxSpeed = maxSpeed;
    this.isScoring = isScoring;
  }

  draw() {
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, true);
    this.ctx.closePath();
    this.ctx.fillStyle = this.color;
    this.ctx.fill();

    if (Ball.helloKittyImg && Ball.helloKittyImg.complete) {
      const size = this.radius * 1.8;
      this.ctx.drawImage(
        Ball.helloKittyImg,
        this.x - size / 2,
        this.y - size / 2,
        size,
        size,
      );
    }
  }

  static helloKittyImg: HTMLImageElement = (() => {
    const img = new window.Image();
    img.src = hk_ball;
    img.onerror = () => console.error('Failed to load Hello Kitty image!');
    return img;
  })();

  update(pong) {
    if (this.isScoring) return; // Don't update if we're in scoring animation

    this.x += this.vx;
    this.y += this.vy;

    // Wall collision (top/bottom)
    if (
      this.y - this.radius < 0 ||
      this.y + this.radius > this.ctx.canvas.height
    ) {
      this.vy = -this.vy;
      // Clamp ball position to prevent sticking
      this.y =
        this.y - this.radius < 0
          ? this.radius
          : this.ctx.canvas.height - this.radius;
    }

    // Left paddle collision with corner detection
    if (
      this.x - this.radius < pong.leftPaddle.x + pong.leftPaddle.width &&
      this.x + this.radius > pong.leftPaddle.x &&
      this.y + this.radius > pong.leftPaddle.y &&
      this.y - this.radius < pong.leftPaddle.y + pong.leftPaddle.height
    ) {
      this.handlePaddleCollision(pong.leftPaddle, true);
    }

    // Right paddle collision with corner detection
    if (
      this.x + this.radius > pong.rightPaddle.x &&
      this.x - this.radius < pong.rightPaddle.x + pong.rightPaddle.width &&
      this.y + this.radius > pong.rightPaddle.y &&
      this.y - this.radius < pong.rightPaddle.y + pong.rightPaddle.height
    ) {
      this.handlePaddleCollision(pong.rightPaddle, false);
    }

    // Ball out of bounds (left or right wall)
    if (
      this.x - this.radius < 0 ||
      this.x + this.radius > this.ctx.canvas.width
    ) {
      const isLeftWall = this.x - this.radius < 0;
      this.isScoring = true;
      pong.isScoring = true; // Set game scoring state

      // Stop the ball at the wall
      this.x = isLeftWall ? this.radius : this.ctx.canvas.width - this.radius;

      // Wait 1 second before resetting
      setTimeout(() => {
        this.isScoring = false;
        pong.isScoring = false; // Reset game scoring state
        this.handleScoring(pong, isLeftWall);
        this.isScoring = false;
      }, 100);
    }
  }

  private handlePaddleCollision(paddle: Paddle, isLeftPaddle: boolean) {
    // Calculate relative intersection point (-1 to 1)
    const relativeIntersectY =
      (this.y - (paddle.y + paddle.height / 2)) / (paddle.height / 2);

    // Limit the maximum angle to 60 degrees (instead of 75)
    const maxAngle = Math.PI / 3; // 60 degrees
    const bounceAngle = relativeIntersectY * maxAngle;

    // Ensure minimum horizontal velocity (e.g., 60% of total speed)
    const minHorizontalRatio = 0.6;
    const direction = isLeftPaddle ? 1 : -1;

    // Calculate velocities
    let vx = direction * this.speed * Math.cos(bounceAngle);
    let vy = this.speed * Math.sin(bounceAngle);

    // If horizontal component is too small, adjust the angle
    if (Math.abs(Math.cos(bounceAngle)) < minHorizontalRatio) {
      const adjustedAngle = Math.acos(minHorizontalRatio);
      vx = direction * this.speed * minHorizontalRatio;
      vy = this.speed * Math.sin(adjustedAngle) * Math.sign(bounceAngle);
    }

    this.vx = vx;
    this.vy = vy;

    // Reposition ball to prevent sticking
    this.x = isLeftPaddle
      ? paddle.x + paddle.width + this.radius
      : paddle.x - this.radius;

    this.increaseSpeed();
  }

  handleScoring(pong, isLeftWall: boolean) {
    // Reset position
    this.x = this.ctx.canvas.width / 2;
    this.y = this.ctx.canvas.height / 2;

    // Reset to initial speed
    const initialVx = this.ctx.canvas.width * 0.003;
    const initialVy = this.ctx.canvas.height * 0.002;

    // Randomize direction but keep initial speed
    this.vx = initialVx * (Math.random() < 0.5 ? 1 : -1);
    this.vy = initialVy * (Math.random() < 0.5 ? 1 : -1);

    // Reset speed to initial value
    this.speed = Math.sqrt(initialVx * initialVx + initialVy * initialVy);

    if (isLeftWall) {
      pong.rightPlayerScore++;
      pong.rightPlayerScoreElement.innerText = pong.rightPlayerScore;
      pong.announcement.innerText = pong.rightPlayer + ' scores!';
    } else {
      pong.leftPlayerScore++;
      pong.leftPlayerScoreElement.innerText = pong.leftPlayerScore;
      pong.announcement.innerText = pong.leftPlayer + ' scores!';
    }
  }

  increaseSpeed() {
    // Reduced speed increase
    const speedIncrease =
      Math.max(this.ctx.canvas.width, this.ctx.canvas.height) * 0.0015; // reduced from 0.0052

    if (this.speed < this.maxSpeed) {
      const newSpeed = Math.min(this.speed + speedIncrease, this.maxSpeed);
      const angle = Math.atan2(this.vy, this.vx);

      // Update velocities while maintaining direction
      this.vx = Math.sign(this.vx) * Math.abs(newSpeed * Math.cos(angle));
      this.vy = Math.sign(this.vy) * Math.abs(newSpeed * Math.sin(angle));
      this.speed = newSpeed;
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
    width = ctx.canvas.width * 0.01,
    height = ctx.canvas.height * 0.25,
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

  move(dy: number) {
    this.y = Math.max(
      0,
      Math.min(this.ctx.canvas.height - this.height, this.y + dy),
    );
  }
}
