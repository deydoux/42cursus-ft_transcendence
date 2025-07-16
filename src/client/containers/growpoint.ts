import {Car} from './car';
import {Wall} from './wall';
import fuel from '../assets/fuel.png';

export class Growpoint {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly canvas: HTMLCanvasElement;
  public x: number;
  public y: number;
  private readonly size: number;
  private readonly padding: number = 20;
  private imageLoaded: boolean;
  private imageWidth: number;
  private imageHeight: number;

  static fuelImg: HTMLImageElement = (() => {
    const img = new window.Image();
    img.src = fuel;
    img.onerror = () => console.error('Failed to load fuel image!');
    return img;
  })();

  constructor(ctx: CanvasRenderingContext2D, x: number, y: number) {
    this.ctx = ctx;
    this.size = ctx.canvas.width * 0.012;
    this.canvas = ctx.canvas;
    this.imageLoaded = false;
    this.x = x;
    this.y = y;

    // Calculate image dimensions - maintaining aspect ratio
    const desiredWidth = this.canvas.width * 0.04;
    const aspectRatio =
      Growpoint.fuelImg.naturalWidth / Growpoint.fuelImg.naturalHeight || 1;

    this.imageWidth = desiredWidth;
    this.imageHeight = desiredWidth / aspectRatio;

    // Ensure image is loaded
    if (Growpoint.fuelImg.complete) {
      this.imageLoaded = true;
    } else {
      Growpoint.fuelImg.onload = () => {
        this.imageLoaded = true;
      };
    }
  }

  public static createRandomGrowpoint(
    ctx: CanvasRenderingContext2D,
    walls: Wall,
  ): Growpoint {
    // Same positioning logic
    const padding = 30;
    const canvas = ctx.canvas;
    let newX: number;
    let newY: number;
    let attempts = 0;
    const maxAttempts = 50;

    do {
      newX = Math.random() * (canvas.width - padding * 2) + padding;
      newY = Math.random() * (canvas.height - padding * 2) + padding;
      attempts++;
    } while (walls.isColliding(newX, newY, padding) && attempts < maxAttempts);

    return new Growpoint(ctx, newX, newY);
  }

  public draw(): void {
    this.ctx.save();

    if (this.imageLoaded && Growpoint.fuelImg.complete) {
      // Make image larger - increase size by 50%
      const scaleFactor = 2;
      const scaledWidth = this.imageWidth * scaleFactor;
      const scaledHeight = this.imageHeight * scaleFactor;

      // Draw the fuel image centered at the growpoint position
      this.ctx.drawImage(
        Growpoint.fuelImg,
        this.x - scaledWidth / 2,
        this.y - scaledHeight / 2,
        scaledWidth,
        scaledHeight,
      );
    } else {
      // Fallback to circle if image isn't loaded yet
      this.ctx.beginPath();
      this.ctx.arc(this.x, this.y, this.size * 1.5, 0, Math.PI * 2);
      this.ctx.fillStyle = 'rgba((255, 0, 179, 0.9)';
      this.ctx.fill();
      this.ctx.strokeStyle = '#00FF00';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
    }

    this.ctx.restore();
  }

  public isColliding(car: Car): boolean {
    const distance = Math.sqrt(
      Math.pow(this.x - car.x, 2) + Math.pow(this.y - car.y, 2),
    );
    // Use same collision detection as Checkpoint
    const scaledWidth = this.imageWidth * 2;
    return distance < scaledWidth / 2 + 15;
  }
}
