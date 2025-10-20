import {Car} from './car';
import {Wall} from './wall';
import slow from '../../assets/slowpoint.svg';

export class Slowpoint {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly canvas: HTMLCanvasElement;
  public x: number;
  public y: number;
  private readonly size: number;
  private readonly padding: number = 20;
  private imageLoaded: boolean;
  private imageWidth: number;
  private imageHeight: number;

  static slowImg: HTMLImageElement = (() => {
    const img = new window.Image();
    img.src = slow;
    img.onerror = () => console.error('Failed to load slow image!');
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
      Slowpoint.slowImg.naturalWidth / Slowpoint.slowImg.naturalHeight || 1;

    this.imageWidth = desiredWidth;
    this.imageHeight = desiredWidth / aspectRatio;

    // Ensure image is loaded
    if (Slowpoint.slowImg.complete) {
      this.imageLoaded = true;
    } else {
      Slowpoint.slowImg.onload = () => {
        this.imageLoaded = true;
      };
    }
  }

  // Static method to create a new Slowpoint at valid position
  public static createRandomSlowpoint(
    ctx: CanvasRenderingContext2D,
    walls: Wall,
  ): Slowpoint {
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

    return new Slowpoint(ctx, newX, newY);
  }

  public draw(): void {
    this.ctx.save();
    if (this.imageLoaded && Slowpoint.slowImg.complete) {
      // Make image larger - increase size by 50%
      const scaleFactor = 2;
      const scaledWidth = this.imageWidth * scaleFactor;
      const scaledHeight = this.imageHeight * scaleFactor;

      // Draw the image centered at the Slowpoint position
      this.ctx.drawImage(
        Slowpoint.slowImg,
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

  public isColliding(car: Car | null): boolean {
    if (!car) throw new Error('car not found');
    const distance = Math.sqrt(
      Math.pow(this.x - car.x, 2) + Math.pow(this.y - car.y, 2),
    );
    return distance < this.size + (car.carWidth || 0) / 2;
  }
}
