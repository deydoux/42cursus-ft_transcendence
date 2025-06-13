export class Track {
  private readonly ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public draw(): void {
    // Draw field background
    this.ctx.fillStyle = '#1a1a1a'; // Dark background
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    // Optional: Draw field grid or markers
    this.drawGrid();
  }

  private drawGrid(): void {
    this.ctx.strokeStyle = '#333333'; // Subtle grid lines
    this.ctx.lineWidth = 1;

    // Draw vertical lines
    for (let x = 0; x < this.ctx.canvas.width; x += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, this.ctx.canvas.height);
      this.ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = 0; y < this.ctx.canvas.height; y += 50) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(this.ctx.canvas.width, y);
      this.ctx.stroke();
    }
  }
}
