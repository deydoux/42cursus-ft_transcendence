export class Paddle {
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  ctx: CanvasRenderingContext2D;

  constructor(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    width = ctx.canvas.width * 0.015,
    height = ctx.canvas.height * 0.25,
    color = 'black',
  ) {
    this.ctx = ctx;
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.color = color;
  }

  draw() {
    // Save the current context state
    this.ctx.save();

    // Set fill style
    this.ctx.fillStyle = this.color;

    // For a more proportional approach
    const radius = Math.min(30, this.width / 2, this.height / 2);

    // Start a new path
    this.ctx.beginPath();

    // Draw rounded rectangle (x, y, width, height, radius)
    this.ctx.moveTo(this.x + radius, this.y);
    this.ctx.arcTo(
      this.x + this.width,
      this.y,
      this.x + this.width,
      this.y + this.height,
      radius,
    );
    this.ctx.arcTo(
      this.x + this.width,
      this.y + this.height,
      this.x,
      this.y + this.height,
      radius,
    );
    this.ctx.arcTo(this.x, this.y + this.height, this.x, this.y, radius);
    this.ctx.arcTo(this.x, this.y, this.x + this.width, this.y, radius);
    this.ctx.closePath();

    // Fill the rounded rectangle
    this.ctx.fill();

    // Restore the context to prevent affecting other elements
    this.ctx.restore();
  }

  move(dy: number) {
    this.y = Math.max(
      0,
      Math.min(this.ctx.canvas.height - this.height, this.y + dy),
    );
  }
}
