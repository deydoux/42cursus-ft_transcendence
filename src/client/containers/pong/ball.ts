import {IPongGame} from '../../types/game';
import {Paddle} from './paddle';
import hk_ball from '../../assets/hk_ball.png';
import {socket} from '../../utils/websocket';

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

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.x = ctx.canvas.width / 2;
    this.y = ctx.canvas.height / 2;
    this.vx = ctx.canvas.width * 0.003;
    this.vy = ctx.canvas.height * 0.002;
    this.radius = ctx.canvas.width * 0.013;
    this.color = 'black';
    this.speed = Math.sqrt(this.vx * this.vx + this.vy * this.vy);
    this.maxSpeed = Math.max(ctx.canvas.width, ctx.canvas.height) * 0.012;
    this.isScoring = false;
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
    } else {
      this.ctx.strokeStyle = '#000000';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }
  }

  static helloKittyImg: HTMLImageElement = (() => {
    const img = new window.Image();
    img.src = hk_ball;
    img.onerror = () => console.error('Failed to load Hello Kitty image!');
    return img;
  })();

  /**
   * Sets the ball's velocity direction and updates its speed.
   * @param dx - The new horizontal velocity direction (normalized).
   * @param dy - The new vertical velocity direction (normalized).
   */
  public setDirection(dx: number, dy: number): void {
    // Calculate the desired speed based on canvas size
    const desiredSpeed =
      Math.max(this.ctx.canvas.width, this.ctx.canvas.height) * 0.005; // Adjust this multiplier as needed

    // Normalize the direction vector
    const magnitude = Math.sqrt(dx * dx + dy * dy);

    if (magnitude > 0) {
      // Apply the desired speed to the normalized direction
      this.vx = (dx / magnitude) * desiredSpeed;
      this.vy = (dy / magnitude) * desiredSpeed;
      this.speed = desiredSpeed;
    } else {
      // Fallback if dx and dy are both 0
      this.vx = desiredSpeed * (Math.random() < 0.5 ? 1 : -1);
      this.vy = desiredSpeed * (Math.random() < 0.5 ? 1 : -1);
      this.speed = desiredSpeed;
    }
  }

  update(pong: IPongGame) {
    if (this.isScoring) return;

    this.y += this.vy;
    this.x += this.vx;

    // Wall collision (simplified)
    if (
      this.y - this.radius < 0 ||
      this.y + this.radius > this.ctx.canvas.height
    ) {
      this.vy = -this.vy;

      // Simple horizontal boost to prevent vertical bouncing
      if (Math.abs(this.vx) < this.speed * 0.3) {
        this.vx = this.vx > 0 ? this.speed * 0.5 : -this.speed * 0.5;
      }

      this.y =
        this.y - this.radius < 0
          ? this.radius
          : this.ctx.canvas.height - this.radius;
    }

    const leftPlayer =
      pong.player.side === 'left' ? pong.player : pong.opponent;
    const rightPlayer =
      pong.player.side === 'right' ? pong.player : pong.opponent;

    // Left paddle collision - only handle if it's my paddle
    if (
      leftPlayer.paddle &&
      this.x - this.radius < leftPlayer.paddle.x + leftPlayer.paddle.width &&
      this.x + this.radius > leftPlayer.paddle.x &&
      this.y + this.radius > leftPlayer.paddle.y &&
      this.y - this.radius < leftPlayer.paddle.y + leftPlayer.paddle.height
    ) {
      if (pong.player.side === 'left') {
        // This is my paddle - handle collision and sync
        this.handlePaddleCollision(leftPlayer.paddle, true);
        if (!pong.isLocal) this.sendBallState(true);
      } else {
        // This is opponent's paddle - only handle physics, no sync
        this.handlePaddleCollision(leftPlayer.paddle, true);
      }
    }

    // Right paddle collision - only handle if it's my paddle
    if (
      rightPlayer.paddle &&
      this.x + this.radius > rightPlayer.paddle.x &&
      this.x - this.radius < rightPlayer.paddle.x + rightPlayer.paddle.width &&
      this.y + this.radius > rightPlayer.paddle.y &&
      this.y - this.radius < rightPlayer.paddle.y + rightPlayer.paddle.height
    ) {
      if (pong.player.side === 'right') {
        // This is my paddle - handle collision and sync
        this.handlePaddleCollision(rightPlayer.paddle, false);
        if (!pong.isLocal) this.sendBallState(false);
      } else {
        // This is opponent's paddle - only handle physics, no sync
        this.handlePaddleCollision(rightPlayer.paddle, false);
      }
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

    // Use a smaller angle range (45 degrees max instead of 75)
    const maxAngle = (Math.PI / 180) * 45; // 45 degrees maximum
    const bounceAngle = relativeIntersectY * maxAngle;
    const minHorizontalRatio = 0.5; // 50% minimum horizontal velocity
    const direction = isLeftPaddle ? 1 : -1;

    // Calculate velocities
    let vx = direction * this.speed * Math.cos(bounceAngle);
    let vy = this.speed * Math.sin(bounceAngle);

    // If horizontal component is too small, force a more horizontal bounce
    if (Math.abs(Math.cos(bounceAngle)) < minHorizontalRatio) {
      const adjustedAngle = Math.acos(minHorizontalRatio);
      vx = direction * this.speed * minHorizontalRatio;
      // Reduce vertical component when adjusting
      vy = this.speed * Math.sin(adjustedAngle) * Math.sign(bounceAngle) * 0.5;
    }

    // Additional check: if vertical velocity is too high, clamp it
    const maxVerticalRatio = 0.6; // Maximum 60% of speed can be vertical
    if (Math.abs(vy) > this.speed * maxVerticalRatio) {
      vy = Math.sign(vy) * this.speed * maxVerticalRatio;
      // Recalculate horizontal to maintain speed
      vx = direction * Math.sqrt(this.speed * this.speed - vy * vy);
    }

    this.vx = vx;
    this.vy = vy;

    // Reposition ball to prevent sticking
    this.x = isLeftPaddle
      ? paddle.x + paddle.width + this.radius
      : paddle.x - this.radius;

    this.increaseSpeed();

    // FIXED: Only send ball state if this is MY paddle collision
    // Don't send on opponent's paddle collisions to prevent sync conflicts
  }

  // Add method to handle YOUR paddle collision
  public handleMyPaddleCollision(
    paddle: Paddle,
    isLeftPaddle: boolean,
    pong: IPongGame,
  ) {
    // Check if this is actually my paddle
    const isMyPaddle =
      (isLeftPaddle && pong.player.side === 'left') ||
      (!isLeftPaddle && pong.player.side === 'right');

    if (isMyPaddle) {
      this.handlePaddleCollision(paddle, isLeftPaddle);
      if (!pong.isLocal) this.sendBallState(isLeftPaddle); // Only send when I hit the ball && game in remote
    }
  }

  // NEW: Method to send ball state after collision
  private sendBallState(isLeftPaddle: boolean) {
    socket.send(
      JSON.stringify({
        type: 'ballState',
        data: {
          x: this.x,
          y: this.y,
          vx: this.vx,
          vy: this.vy,
          speed: this.speed,
          timestamp: Date.now(),
          side: isLeftPaddle ? 'left' : 'right', // Which paddle was hit
        },
      }),
    );
  }

  // NEW: Method to receive and apply ball state from opponent
  public receiveBallState(data: {
    x: number;
    y: number;
    vx: number;
    vy: number;
    speed: number;
    timestamp: number;
    side: 'left' | 'right';
  }): void {
    // Only apply if this is from the opponent's paddle collision
    // and the timestamp is recent (within reasonable network delay)
    const timeDiff = Date.now() - data.timestamp;

    if (timeDiff < 200) {
      // 200ms tolerance for network delay
      this.x = data.x;
      this.y = data.y;
      this.vx = data.vx;
      this.vy = data.vy;
      this.speed = data.speed;
      console.log(`Received ball state from ${data.side} paddle`);
    }
  }

  handleScoring(pong: IPongGame, isLeftWall: boolean) {
    if (isLeftWall && pong.player.side == 'left') {
      pong.opponent.score++;
      if (!pong.isLocal)
        socket.send(
          JSON.stringify({
            type: 'score',
            scorerID: pong.opponent.id,
          }),
        );
    } else if (!isLeftWall && pong.player.side == 'right') {
      pong.opponent.score++;
      if (!pong.isLocal)
        socket.send(
          JSON.stringify({
            type: 'score',
            scorerID: pong.opponent.id,
          }),
        );
    } else if (isLeftWall && pong.player.side == 'right') {
      pong.player.score++;
      if (!pong.isLocal)
        socket.send(
          JSON.stringify({
            type: 'score',
            scorerID: pong.player.id,
          }),
        );
    } else {
      pong.player.score++;
      if (!pong.isLocal)
        socket.send(
          JSON.stringify({
            type: 'score',
            scorerID: pong.player.id,
          }),
        );
    }

    // Reset the timer
    pong.timer.reset();
    pong.timer.startCountdown();

    // Reset position
    this.x = this.ctx.canvas.width / 2;
    this.y = this.ctx.canvas.height / 2;

    // Only set initial direction for local games
    if (pong.isLocal) {
      // Reset to initial speed with random direction for local games
      const initialVx = this.ctx.canvas.width * 0.003;
      const initialVy = this.ctx.canvas.height * 0.002;

      // Randomize direction
      this.vx = initialVx * (Math.random() < 0.5 ? 1 : -1);
      this.vy = initialVy * (Math.random() < 0.5 ? 1 : -1);

      // Reset speed to initial value
      this.speed = Math.sqrt(initialVx * initialVx + initialVy * initialVy);
    } else {
      // For remote games, stop the ball and wait for server direction
      this.vx = 0;
      this.vy = 0;
      this.speed = 0;
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
