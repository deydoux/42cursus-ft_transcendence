import {Car} from './car';

export class Checkpoint {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly canvas: HTMLCanvasElement;
  public x: number;
  public y: number;
  private readonly size: number = 20;
  private readonly padding: number = 20;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
    this.x =
      Math.random() * (this.canvas.width - this.padding * 2) + this.padding;
    this.y =
      Math.random() * (this.canvas.height - this.padding * 2) + this.padding;
  }

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

  public isColliding(car: Car): boolean {
    const distance = Math.sqrt(
      Math.pow(this.x - car.x, 2) + Math.pow(this.y - car.y, 2),
    );
    return distance < this.size + 15; // 15 is half the car width
  }
}
