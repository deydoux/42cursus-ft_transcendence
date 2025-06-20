import {Car} from './car';
import {Wall} from './wall';

export class Growpoint {
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

  // Static method to create a new Growpoint at valid position
  public static createRandomGrowpoint(
    ctx: CanvasRenderingContext2D,
    walls: Wall,
  ): Growpoint {
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
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(255, 13, 0, 0.5)';
    this.ctx.fill();
    this.ctx.strokeStyle = '#00FF00';
    this.ctx.lineWidth = 1.5;
    this.ctx.stroke();
    this.ctx.restore();
  }

  public isColliding(car: Car): boolean {
    const distance = Math.sqrt(
      Math.pow(this.x - car.x, 2) + Math.pow(this.y - car.y, 2),
    );
    return distance < this.size + 15; // 15 is half the car width
  }
}
