import {Car} from './car';
import {Wall} from './wall';

/**
 * Represents a checkpoint in the game.
 * Checkpoints are used to track progress and can be collected by the player.
 * */
export class Checkpoint {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly canvas: HTMLCanvasElement;
  public x: number;
  public y: number;
  private readonly size: number;
  private readonly padding: number = 20;

  constructor(ctx: CanvasRenderingContext2D, x: number, y: number) {
    this.ctx = ctx;
    this.size = ctx.canvas.width * 0.012;
    this.canvas = ctx.canvas;
    this.x = x;
    this.y = y;
  }

  // Static method to create a new checkpoint at valid position
  public static createRandomCheckpoint(
    ctx: CanvasRenderingContext2D,
    walls: Wall,
    existingCheckpoints: Checkpoint[] = [],
  ): Checkpoint {
    const padding = 30;
    const canvas = ctx.canvas;
    const minDistance = 200; // Minimum distance between checkpoints
    let newX: number;
    let newY: number;
    let attempts = 0;
    const maxAttempts = 80;

    do {
      newX = Math.random() * (canvas.width - padding * 2) + padding;
      newY = Math.random() * (canvas.height - padding * 2) + padding;
      attempts++;
    } while (
      (walls.isColliding(newX, newY, padding) ||
        this.isTooCloseToExisting(
          newX,
          newY,
          existingCheckpoints,
          minDistance,
        )) &&
      attempts < maxAttempts
    );

    return new Checkpoint(ctx, newX, newY);
  }

  /**
   * Checks if the new checkpoint position is too close to existing checkpoints.
   * @param x
   * @param y
   * @param existingCheckpoints
   * @param minDistance
   * @returns
   */
  private static isTooCloseToExisting(
    x: number,
    y: number,
    existingCheckpoints: Checkpoint[],
    minDistance: number,
  ): boolean {
    return existingCheckpoints.some(checkpoint => {
      const distance = Math.sqrt(
        Math.pow(x - checkpoint.x, 2) + Math.pow(y - checkpoint.y, 2),
      );
      return distance < minDistance;
    });
  }

  /**
   * Draws the checkpoint on the canvas.
   * The checkpoint is represented as a circle with a glowing effect.
   */
  public draw(): void {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(0, 255, 0, 0.5)';
    this.ctx.fill();
    this.ctx.strokeStyle = '#00FF00';
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
    this.ctx.restore();
  }

  /**
   * Checks if the checkpoint is colliding with a car.
   * @param car The car to check collision against
   * @returns True if the car is colliding with the checkpoint, false otherwise
   */
  public isColliding(car: Car): boolean {
    const distance = Math.sqrt(
      Math.pow(this.x - car.x, 2) + Math.pow(this.y - car.y, 2),
    );
    return distance < this.size + 15; // 15 is half the car width
  }
}
