import {Wall} from './wall';

export class Car {
  private readonly ctx: CanvasRenderingContext2D;

  public x: number;
  public y: number;
  public angle: number;
  public speed: number;
  public acceleration: number;
  public color: string;
  public name: string;
  public carWidth;
  public carHeight;

  private readonly maxSpeed = 5;
  private readonly turnSpeed = 0.05;
  private readonly minSpeedForTurn = 0.1;
  private readonly reverseSpeed = -2; // Max reverse speed

  constructor(
    name: string,
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
  ) {
    this.name = name;
    this.carHeight = 20; // Fixed height
    this.carWidth = 30; // Fixed width
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
    this.ctx.fillRect(
      -this.carWidth / 2, // Use half of actual width
      -this.carHeight / 2, // Use half of actual height
      this.carWidth, // Use full width
      this.carHeight,
    );

    this.ctx.restore();
  }

  public move(
    isAccelerating: boolean | null,
    isTurning: number,
    walls: Wall,
  ): void {
    // Handle acceleration/deceleration with reverse
    if (isAccelerating === true) {
      this.speed += this.acceleration;
    } else if (isAccelerating === false) {
      this.speed -= this.acceleration;
    } else {
      // No input (null case) - apply friction
      this.speed *= 0.95;
    }

    // Clamp speed between reverse and max forward speed
    this.speed = Math.min(
      Math.max(this.speed, this.reverseSpeed),
      this.maxSpeed,
    );

    // Calculate potential new position
    const newX = this.x + Math.cos(this.angle) * this.speed;
    const newY = this.y + Math.sin(this.angle) * this.speed;

    // Create car hitbox
    const carBox = {
      x: newX - this.carWidth / 2,
      y: newY - this.carHeight / 2,
      width: this.carWidth,
      height: this.carHeight,
    };

    // Check canvas boundaries
    const inBounds =
      carBox.x >= 0 &&
      carBox.x + carBox.width <= this.ctx.canvas.width &&
      carBox.y >= 0 &&
      carBox.y + carBox.height <= this.ctx.canvas.height;

    // Update position if not colliding and in bounds
    if (!walls.isCarColliding(carBox) && inBounds) {
      this.x = newX;
      this.y = newY;
    } else {
      // Allow sliding along walls/boundaries by trying individual axis movement
      const tryHorizontal = {
        ...carBox,
        x: newX - this.carWidth / 2,
        y: this.y - this.carHeight / 2,
      };

      const tryVertical = {
        ...carBox,
        x: this.x - this.carWidth / 2,
        y: newY - this.carHeight / 2,
      };

      // Try horizontal movement
      if (
        !walls.isCarColliding(tryHorizontal) &&
        tryHorizontal.x >= 0 &&
        tryHorizontal.x + this.carWidth <= this.ctx.canvas.width
      ) {
        this.x = newX;
      }

      // Try vertical movement
      if (
        !walls.isCarColliding(tryVertical) &&
        tryVertical.y >= 0 &&
        tryVertical.y + this.carHeight <= this.ctx.canvas.height
      ) {
        this.y = newY;
      }

      // Reduce speed on collision
      this.speed *= 0.5;
    }

    // Handle turning - works in both forward and reverse
    if (Math.abs(this.speed) > this.minSpeedForTurn) {
      // Invert turning direction when reversing
      const turnDirection = this.speed >= 0 ? 1 : -1;
      this.angle += isTurning * this.turnSpeed * turnDirection;
    }
  }
}
