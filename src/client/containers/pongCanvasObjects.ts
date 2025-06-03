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
  gameContainer: HTMLCanvasElement;
  isScoring: boolean;

  constructor(
    ctx: CanvasRenderingContext2D,
    gameContainer: HTMLCanvasElement,
    x = gameContainer.width / 2,
    y = gameContainer.height / 2,
    vx = gameContainer.height * 0.006,
    vy = gameContainer.width * 0.004,
    radius = gameContainer.width * 0.012,
    color = 'white',
    speed = Math.sqrt(vx * vx + vy * vy),
    maxSpeed = Math.max(gameContainer.width, gameContainer.height) * 0.02,
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
    this.gameContainer = gameContainer;
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
    if (this.y - this.radius < 0 || this.y + this.radius > pong.canvasHeight) {
      this.vy = -this.vy;
    }

    // Left paddle collision
    if (
      this.x - this.radius < pong.leftPaddle.x + pong.leftPaddle.width &&
      this.y > pong.leftPaddle.y &&
      this.y < pong.leftPaddle.y + pong.leftPaddle.height
    ) {
      this.handlePaddleCollision(pong.leftPaddle, true);
    }

    // Right paddle collision
    if (
      this.x + this.radius > pong.rightPaddle.x &&
      this.y > pong.rightPaddle.y &&
      this.y < pong.rightPaddle.y + pong.rightPaddle.height
    ) {
      this.handlePaddleCollision(pong.rightPaddle, false);
    }

    // Ball out of bounds (left or right wall)
    if (this.x - this.radius < 0 || this.x + this.radius > pong.canvasWidth) {
      const isLeftWall = this.x - this.radius < 0;
      this.isScoring = true;
      pong.isScoring = true; // Set game scoring state

      // Stop the ball at the wall
      this.x = isLeftWall ? this.radius : pong.canvasWidth - this.radius;

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

    // Calculate bounce angle (maximum 75 degrees)
    const bounceAngle = (relativeIntersectY * (5 * Math.PI)) / 12;

    // Calculate new velocity
    const direction = isLeftPaddle ? 1 : -1;
    this.vx = direction * Math.abs(this.speed * Math.cos(bounceAngle));
    this.vy = this.speed * Math.sin(bounceAngle);

    // Reposition ball to prevent sticking
    this.x = isLeftPaddle
      ? paddle.x + paddle.width + this.radius
      : paddle.x - this.radius;

    this.increaseSpeed();
  }

  handleScoring(pong, isLeftWall: boolean) {
    this.x = pong.canvasWidth / 2;
    this.y = pong.canvasHeight / 2;
    this.vx = Math.abs(this.vx) * (Math.random() < 0.5 ? 1 : -1);
    this.speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy); // Reset speed

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
    // Increase speed by 10% each paddle hit, but don't exceed maxSpeed
    console.log(`Current speed: ${this.speed}, maxSpeed: ${this.maxSpeed}`);
    if (this.speed < this.maxSpeed) {
      const newSpeed = Math.min(this.speed * 1.15, this.maxSpeed);
      const angle = Math.atan2(this.vy, this.vx);
      this.vx = Math.sign(this.vx) * Math.abs(newSpeed * Math.cos(angle));
      this.vy = Math.sign(this.vy) * Math.abs(newSpeed * Math.sin(angle));
      console.log(
        `Ball speed increased: new speed = ${newSpeed}, vx = ${this.vx}, vy = ${this.vy}`,
      );
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
