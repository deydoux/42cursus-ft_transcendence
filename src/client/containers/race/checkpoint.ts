import {Car} from './car';
import {Wall} from './wall';
import star from '../../assets/star.png';

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
  private imageLoaded: boolean;
  private imageWidth: number;
  private imageHeight: number;

  // Keep static image loader
  static starImg: HTMLImageElement = (() => {
    const img = new window.Image();
    img.src = star;
    img.onerror = () => console.error('Failed to load star image!');
    return img;
  })();

  constructor(ctx: CanvasRenderingContext2D, x: number, y: number) {
    this.ctx = ctx;
    this.size = ctx.canvas.width * 0.012; // Base collision size
    this.canvas = ctx.canvas;
    this.imageLoaded = false;
    this.x = x;
    this.y = y;

    // Calculate image dimensions - maintaining aspect ratio
    const desiredWidth = this.canvas.width * 0.02; // Adjust this value as needed
    const aspectRatio =
      Checkpoint.starImg.naturalWidth / Checkpoint.starImg.naturalHeight || 1;

    this.imageWidth = desiredWidth;
    this.imageHeight = desiredWidth / aspectRatio;

    // Ensure image is loaded
    if (Checkpoint.starImg.complete) {
      this.imageLoaded = true;
    } else {
      Checkpoint.starImg.onload = () => {
        this.imageLoaded = true;
      };
    }
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
   * Draws the checkpoint on the canvas using the ring image.
   */
  public draw(): void {
    this.ctx.save();

    if (this.imageLoaded && Checkpoint.starImg.complete) {
      // Make image larger - increase size by 50%
      const scaleFactor = 2;
      const scaledWidth = this.imageWidth * scaleFactor;
      const scaledHeight = this.imageHeight * scaleFactor;

      // Enhanced glow effect - brighter and more visible
      this.ctx.shadowColor = 'rgba(255, 255, 120, 1.0)'; // Brighter yellow
      this.ctx.shadowBlur = 18; // Increased blur radius
      this.ctx.shadowOffsetX = 0;
      this.ctx.shadowOffsetY = 0;
      this.ctx.globalAlpha = 1.0; // Full opacity

      // Draw the ring image centered at the checkpoint position
      this.ctx.drawImage(
        Checkpoint.starImg,
        this.x - scaledWidth / 2,
        this.y - scaledHeight / 2,
        scaledWidth,
        scaledHeight,
      );

      // Add an extra layer of glow with composite operations
      this.ctx.globalCompositeOperation = 'lighter';
      this.ctx.shadowBlur = 25; // Even more blur for the glow layer
      this.ctx.shadowColor = 'rgba(255, 255, 0, 0.9)';
      this.ctx.globalAlpha = 0.7;
    } else {
      // Fallback to circle if image isn't loaded yet
      // Make the fallback brighter too
      this.ctx.beginPath();
      this.ctx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba(120, 255, 120, 0.7)';
      this.ctx.fill();
      this.ctx.shadowColor = '#FFFF00';
      this.ctx.shadowBlur = 15;
      this.ctx.strokeStyle = '#FFFF00';
      this.ctx.lineWidth = 3;
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  /**
   * Checks if the checkpoint is colliding with a car.
   * Use the image dimensions for collision detection
   */
  public isColliding(car: Car | null): boolean {
    if (!car) throw new Error('car not found');
    const distance = Math.sqrt(
      Math.pow(this.x - car.x, 2) + Math.pow(this.y - car.y, 2),
    );
    // Use half of scaled image width as collision radius
    const scaledWidth = this.imageWidth * 2; // Match the scaling factor in draw()
    return distance < scaledWidth / 2 + 15;
  }
}
//TODO: game instructions on canvas sprite
