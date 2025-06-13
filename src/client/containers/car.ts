export class Car {
  private readonly ctx: CanvasRenderingContext2D;

  public x: number;
  public y: number;
  public angle: number;
  public speed: number;
  public acceleration: number;
  public color: string;
  public name: string;

  private readonly maxSpeed = 5;
  private readonly turnSpeed = 0.05;
  private readonly minSpeedForTurn = 0.1;

  constructor(
    name: string,
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
  ) {
    this.name = name;
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.speed = 0;
    this.acceleration = 0.2;
    this.color = color;
  }

  public draw(): void {
    this.ctx.save();
    this.ctx.translate(this.x, this.y);
    this.ctx.rotate(this.angle);

    // Draw car body
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(-15, -10, 30, 20);

    this.ctx.restore();
  }

  public move(isAccelerating: boolean, isTurning: number): void {
    // Handle acceleration/deceleration
    if (isAccelerating) {
      this.speed += this.acceleration;
    } else {
      this.speed *= 0.95; // Friction
    }

    // Clamp speed between 0 and max speed
    this.speed = Math.min(Math.max(this.speed, 0), this.maxSpeed);

    // Handle turning - only if moving
    if (Math.abs(this.speed) > this.minSpeedForTurn) {
      // Turn rate increases with speed but not too extremely
      const turnRate = this.turnSpeed * (0.5 + this.speed / this.maxSpeed);
      this.angle += isTurning * turnRate;
    }

    // Calculate new position
    const newX = this.x + Math.cos(this.angle) * this.speed;
    const newY = this.y + Math.sin(this.angle) * this.speed;

    // Get canvas boundaries
    const carWidth = 30; // Width of car from draw method
    const carHeight = 20; // Height of car from draw method
    const halfWidth = carWidth / 2;
    const halfHeight = carHeight / 2;

    // Check boundaries and update position only if within bounds
    if (newX >= halfWidth && newX <= this.ctx.canvas.width - halfWidth) {
      this.x = newX;
    } else {
      this.speed = 0; // Stop the car at boundary
    }

    if (newY >= halfHeight && newY <= this.ctx.canvas.height - halfHeight) {
      this.y = newY;
    } else {
      this.speed = 0; // Stop the car at boundary
    }
  }
}
