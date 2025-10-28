import {getCurrentGame, getRaceCanvasInstance} from '../../utils/content';
import {Socket} from '../../services/websocket';
import {Wall} from './wall';

/**
 * Represents a car in the game.
 * The car can move, accelerate, turn, and collide with walls and other cars.
 * It can also be slowed down or made bigger temporarily.
 */
export class Car {
  private readonly ctx: CanvasRenderingContext2D;

  public x: number;
  public y: number;
  public angle: number;
  public speed: number;
  public acceleration: number;
  public color: string;
  public carImage: HTMLImageElement | undefined;
  public carWidth: number;
  public carHeight: number;
  public isSlowed: boolean;
  public isBigger: boolean;
  public slowdownEndTime: number;
  public growthEndTime: number;
  public score: number;
  public ratioGrowth: number;
  public isStopped: boolean;
  public imageLoaded = false;

  private readonly maxSpeed: number;
  private readonly turnSpeed: number = 0.1;
  private readonly minSpeedForTurn: number;
  private readonly reverseSpeed: number;
  private readonly slowdownDuration: number = 10000;
  private readonly growthDuration: number = 20000;
  private readonly slowdownFactor: number = 0.3; // 30% of normal speed
  private readonly growthFactor: number = 0.02; // 30% of normal speed

  private websocket = Socket.getInstance();

  constructor(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
    sprite: string,
  ) {
    this.isSlowed = false;
    this.isBigger = false;
    this.slowdownEndTime = 0;
    this.color = color;
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.angle = 0;
    this.speed = 0;
    this.acceleration = 0.3;
    this.score = 0;
    this.ratioGrowth = 0;
    this.isStopped = false;
    this.carWidth = 0;
    this.carHeight = 0;
    this.growthEndTime = 0;

    const speedScale = Math.min(ctx.canvas.width, ctx.canvas.height) / 500;

    this.maxSpeed = 3.75 * speedScale;
    this.minSpeedForTurn = 0.2 * speedScale;
    this.reverseSpeed = -3 * speedScale;

    if (sprite) {
      this.carImage = Car.createCarImage(sprite);
      this.carImage.onload = () => {
        this.imageLoaded = true;
        this.setCarDimensionsFromImage(0);
      };
    } else this.setDefaultCarDimensions(0);
  }

  /**
   * Sets car dimensions based on the loaded image.
   * This ensures the car maintains its aspect ratio and fits well within the canvas.
   * @param newRatio The ratio to adjust the size based on the image
   */
  private setCarDimensionsFromImage(newRatio: number): void {
    if (!this.carImage) return;

    // If newRatio is 0, reset to base size. Otherwise, add to current ratio
    if (newRatio === 0) {
      this.ratioGrowth = 0;
    } else {
      this.ratioGrowth += newRatio;
    }

    // Calculate scale based on canvas size
    const targetSize =
      Math.min(this.ctx.canvas.width, this.ctx.canvas.height) *
      (0.06 + this.ratioGrowth);

    // Maintain aspect ratio - scale based on the larger dimension
    const imageRatio = this.carImage.width / this.carImage.height;

    if (this.carImage.width > this.carImage.height) {
      // Image is wider than tall
      this.carWidth = targetSize;
      this.carHeight = targetSize / imageRatio;
    } else {
      // Image is taller than wide
      this.carHeight = targetSize;
      this.carWidth = targetSize * imageRatio;
    }
  }

  /**
   * Sets default car dimensions based on the canvas size and growth ratio.
   * This is used when no sprite is provided.
   * @param newRatio The ratio to adjust the default size, or 0 to reset to base size
   */
  private setDefaultCarDimensions(newRatio: number): void {
    // If newRatio is 0, reset to base size. Otherwise, add to current ratio
    if (newRatio === 0) {
      this.ratioGrowth = 0;
    } else {
      this.ratioGrowth += newRatio;
    }

    // Default car dimensions when no sprite is used
    this.carWidth =
      Math.min(this.ctx.canvas.width, this.ctx.canvas.height) *
      (0.06 + this.ratioGrowth);
    this.carHeight = this.carWidth * 0.6; // 1.67:1 ratio (typical car proportions)
  }

  /**
   * apply slowdown effect
   */
  public applySlowdown(): void {
    this.isSlowed = true;
    this.slowdownEndTime = Date.now() + this.slowdownDuration;
    this.speed *= 0.8; // Initial speed reduction
  }

  /**
   * Resets the car's slowdown status
   */
  public resetSlowdownStatus(): void {
    this.isSlowed = false;
  }

  /**
   * check and update slowdown status
   */
  public updateSlowdownStatus(): void {
    const gameID = getCurrentGame().id.toString() || '';
    const raceCanvas = getRaceCanvasInstance(gameID);
    if (this.isSlowed && Date.now() > this.slowdownEndTime) {
      if (!raceCanvas.race.isLocal) {
        this.websocket.send({
          type: 'updateSlowdown',
          playerId: raceCanvas.race.player.id,
        });
      }
      this.resetSlowdownStatus();
    }
  }

  /**
   * apply car growth effect
   */
  public applyCarGrowth(): void {
    this.isBigger = true;
    this.growthEndTime = Date.now() + this.growthDuration;
    if (this.carImage) {
      this.setCarDimensionsFromImage(this.growthFactor);
    } else {
      this.setDefaultCarDimensions(this.growthFactor);
    }
  }

  /* public applyCarGrowth(): void {
    // Check if growing would cause collision with walls
    const testRatio = this.ratioGrowth + this.growthFactor;
    const testSize =
      Math.min(this.ctx.canvas.width, this.ctx.canvas.height) *
      (0.06 + testRatio);

    let testWidth, testHeight;
    if (this.carImage) {
      const imageRatio = this.carImage.width / this.carImage.height;
      if (this.carImage.width > this.carImage.height) {
        testWidth = testSize;
        testHeight = testSize / imageRatio;
      } else {
        testHeight = testSize;
        testWidth = testSize * imageRatio;
      }
    } else {
      testWidth = testSize;
      testHeight = testSize * 0.6;
    }

    const testPosition = {
      x: this.x - testWidth / 2,
      y: this.y - testHeight / 2,
      width: testWidth,
      height: testHeight,
    };

    // Get wall instance to check collision
    const gameID = getCurrentGame().id.toString() || '';
    const raceCanvas = getRaceCanvasInstance(gameID);

    // Only grow if it won't cause a collision
    if (!raceCanvas.race.wall.isCarColliding(testPosition)) {
      this.isBigger = true;
      this.growthEndTime = Date.now() + this.growthDuration;
      if (this.carImage) {
        this.setCarDimensionsFromImage(this.growthFactor);
      } else {
        this.setDefaultCarDimensions(this.growthFactor);
      }
    } else {
      console.log('Growth prevented due to wall collision');
    }
  } */

  /**
   * Resets the car's growth status and dimensions
   */
  public resetGrowthStatus(): void {
    // Check if car is already at base size to avoid making it smaller
    if (!this.isBigger && this.ratioGrowth <= 0) {
      return; // Car is already at normal size or smaller, no need to reset
    }

    this.isBigger = false;
    this.ratioGrowth = 0;
    if (this.carImage) {
      this.setCarDimensionsFromImage(0); // Pass 0 to set to base size
    } else {
      this.setDefaultCarDimensions(0); // Pass 0 to set to base size
    }
  }

  /**
   * Updates the growth status of the car.
   * If the growth duration has ended, it resets the car size.
   */
  public updateGrowthStatus() {
    const gameID = getCurrentGame().id.toString() || '';
    const raceCanvas = getRaceCanvasInstance(gameID);
    if (this.isBigger && Date.now() > this.growthEndTime) {
      if (!raceCanvas.race.isLocal) {
        this.websocket.send({
          type: 'updateGrowth',
          playerId: raceCanvas.race.player.id,
        });
      }
      this.resetGrowthStatus(); // Use the new method
    }
  }

  /**
   *  Get current effective max speed based on slowdown status
   */
  private getEffectiveMaxSpeed(): number {
    return this.isSlowed ? this.maxSpeed * this.slowdownFactor : this.maxSpeed;
  }

  /**
   *  Get current effective acceleration based on slowdown status
   */
  private getEffectiveAcceleration(): number {
    return this.isSlowed
      ? this.acceleration * this.slowdownFactor
      : this.acceleration;
  }

  /**
   * Draws the car on the canvas.
   * The car is drawn as a sprite if available, otherwise as a colored rectangle.
   * It also handles slowdown and stopped states with visual indicators.
   */
  public draw(): void {
    this.ctx.save();
    this.ctx.translate(this.x, this.y);
    this.ctx.rotate(this.angle + Math.PI / 2);

    if (this.carImage && this.imageLoaded) {
      // Draw car sprite
      this.ctx.globalAlpha = this.isSlowed ? 0.5 : 1.0; // Transparency when slowed
      this.ctx.drawImage(
        this.carImage,
        -this.carWidth / 2,
        -this.carHeight / 2,
        this.carWidth,
        this.carHeight,
      );
      this.ctx.globalAlpha = 1.0; // Reset alpha
    } else {
      // Fallback to colored rectangle
      this.ctx.fillStyle = this.isSlowed ? `${this.color}80` : this.color;
      this.ctx.fillRect(
        -this.carWidth / 2,
        -this.carHeight / 2,
        this.carWidth,
        this.carHeight,
      );
    }

    if (this.isSlowed) {
      this.ctx.fillStyle = '#2713ddff';
      this.ctx.beginPath();
      this.ctx.arc(
        0, // Center horizontally on the car
        -this.carHeight / 2 - 10, // Position above the car
        5, // Radius of the dot
        0,
        2 * Math.PI,
      );
      this.ctx.fill();
    }

    if (this.isStopped) {
      this.ctx.fillStyle = '#ddeb1aff';
      this.ctx.beginPath();
      this.ctx.arc(
        0, // Center horizontally on the car
        -this.carHeight / 2 - 10, // Position above the car
        5, // Radius of the dot
        0,
        2 * Math.PI,
      );
      this.ctx.fill();
    }

    this.ctx.restore();
  }

  /**
   *  Static method to create car images
   * @param src The source URL of the car image
   * @returns An HTMLImageElement with the loaded image
   */
  static createCarImage(src: string): HTMLImageElement {
    const img = new Image();
    img.src = src;
    img.onerror = () => console.error(`Failed to load car image: ${src}`);
    return img;
  }

  /**
   * Moves the car based on acceleration, turning, and wall collisions.
   * Handles special cases for stuck cars and applies friction.
   * @param isAccelerating
   * @param isTurning
   * @param walls
   * @returns
   */
  public move(
    isAccelerating: boolean | null,
    isTurning: number,
    walls: Wall,
  ): void {
    if (this.isStopped) return;

    // Check if car is stuck in a wall
    const currentPosition = {
      x: this.x - this.carWidth / 2,
      y: this.y - this.carHeight / 2,
      width: this.carWidth,
      height: this.carHeight,
    };

    const isStuck = walls.isCarColliding(currentPosition);

    // Special case for stuck cars - allow escaping regardless of walls
    if (isStuck) {
      // Apply "emergency" movement in reverse direction of current angle
      const escapeSpeed = -1.5; // Force backward movement
      this.x += Math.cos(this.angle) * escapeSpeed;
      this.y += Math.sin(this.angle) * escapeSpeed;
      return;
    }
    const effectiveAcceleration = this.getEffectiveAcceleration() + 0.5;
    const effectiveMaxSpeed = this.getEffectiveMaxSpeed();

    // Handle acceleration/deceleration with modified values
    if (isAccelerating === true) {
      this.speed += effectiveAcceleration;
    } else if (isAccelerating === false) {
      this.speed -= effectiveAcceleration;
    } else {
      // No input (null case) - apply friction
      this.speed *= 0.95;
    }

    // Clamp speed between reverse and effective max forward speed
    this.speed = Math.min(
      Math.max(this.speed, this.reverseSpeed),
      effectiveMaxSpeed,
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

  /**
   * Increases the car's size temporarily.
   * This is used for power-ups or special effects.
   */
  public stopFor(): void {
    this.isStopped = true;
    setTimeout(() => {
      this.isStopped = false;
    }, 15000);
  }

  /**
   * Returns the bounding box of the car for collision detection.
   * The bounding box is an object with x, y, width, and height properties.
   */
  public getBoundingBox(): {
    x: number;
    y: number;
    width: number;
    height: number;
  } {
    const width = this.carWidth || 0;
    const height = this.carHeight || 0;
    return {
      x: this.x - width / 2,
      y: this.y - height / 2,
      width: width,
      height: height,
    };
  }

  /**
   * Checks if this car is colliding with another car.
   * Uses axis-aligned bounding box (AABB) collision detection.
   * @param otherCar The other car to check collision against
   * @returns True if the cars are colliding, false otherwise
   */
  public isCollidingWithCar(otherCar: Car | null): boolean {
    if (!otherCar) throw new Error('car not found');
    const thisBox = this.getBoundingBox();
    const otherBox = otherCar.getBoundingBox();

    const collision =
      thisBox.x < otherBox.x + otherBox.width &&
      thisBox.x + thisBox.width > otherBox.x &&
      thisBox.y < otherBox.y + otherBox.height &&
      thisBox.y + thisBox.height > otherBox.y;

    return collision;
  }

  /**
   * Handles collision with another car.
   * Adjusts positions and speeds to resolve the collision.
   * @param otherCar The other car involved in the collision
   */
  public handleCarCollision(otherCar: Car): void {
    // Calculate collision direction
    const dx = this.x - otherCar.x;
    const dy = this.y - otherCar.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return;

    // Normalize direction
    const normalX = dx / distance;
    const normalY = dy / distance;

    // Push cars apart
    const pushDistance = 10;

    // Calculate new potential positions
    const newThisX = this.x + normalX * pushDistance;
    const newThisY = this.y + normalY * pushDistance;
    const newOtherX = otherCar.x - normalX * pushDistance;
    const newOtherY = otherCar.y - normalY * pushDistance;

    // Check if new positions would be in bounds (using car center positions)
    const thisInBounds =
      newThisX - this.carWidth / 2 >= 0 &&
      newThisX + this.carWidth / 2 <= this.ctx.canvas.width &&
      newThisY - this.carHeight / 2 >= 0 &&
      newThisY + this.carHeight / 2 <= this.ctx.canvas.height;

    const otherInBounds =
      newOtherX - otherCar.carWidth / 2 >= 0 &&
      newOtherX + otherCar.carWidth / 2 <= this.ctx.canvas.width &&
      newOtherY - otherCar.carHeight / 2 >= 0 &&
      newOtherY + otherCar.carHeight / 2 <= this.ctx.canvas.height;

    // Only move cars if both would remain in bounds
    if (thisInBounds && otherInBounds) {
      this.x = newThisX;
      this.y = newThisY;
      otherCar.x = newOtherX;
      otherCar.y = newOtherY;
    }

    // Reduce both cars' speeds regardless
    this.speed *= 0.3;
    otherCar.speed *= 0.3;
  }
}
