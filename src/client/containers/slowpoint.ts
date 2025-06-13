import {Car} from './car';
import {Wall} from './wall';

export class Slowpoint {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly canvas: HTMLCanvasElement;
  public x: number;
  public y: number;
  private readonly size: number = 20;
  private readonly padding: number = 20;

  constructor(ctx: CanvasRenderingContext2D, x: number, y: number) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.x = x;
    this.y = y;
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
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    this.ctx.fillStyle = 'rgba(195, 0, 255, 0.5)';
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
    return distance < this.size + car.carWidth / 2;
  }
}
