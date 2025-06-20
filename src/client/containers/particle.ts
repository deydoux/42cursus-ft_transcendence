export class Particle {
  private readonly ctx: CanvasRenderingContext2D;
  private x: number;
  private y: number;
  private vx: number;
  private vy: number;
  private alpha: number;
  private color: string;
  private size: number;

  constructor(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    color: string,
  ) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.vx = (Math.random() - 0.5) * 4;
    this.vy = (Math.random() - 0.5) * 4;
    this.alpha = 5;
    this.color = color;
    this.size = Math.random() * 4 + 4;
  }

  public update(): boolean {
    this.x += this.vx;
    this.y += this.vy;
    this.alpha *= 0.95;
    return this.alpha > 0.1;
  }

  public draw(): void {
    this.ctx.save();
    this.ctx.globalAlpha = this.alpha;
    this.ctx.fillStyle = this.color;
    this.ctx.beginPath();
    this.ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    this.ctx.fill();
    this.ctx.restore();
  }
}
