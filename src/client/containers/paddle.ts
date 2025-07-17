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
    width = ctx.canvas.width * 0.01,
    height = ctx.canvas.height * 0.25,
    color = 'white',
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

    // Apply the glow effect matching CSS variables
    this.ctx.shadowColor = 'rgb(243, 58, 106)'; // --glow-color
    this.ctx.shadowBlur = 15; // Adjusted for canvas
    this.ctx.shadowOffsetX = 0;
    this.ctx.shadowOffsetY = 0;

    // Draw the paddle with glow
    this.ctx.fillStyle = this.color;
    this.ctx.fillRect(this.x, this.y, this.width, this.height);

    // Add inner glow
    this.ctx.shadowBlur = 5;
    this.ctx.shadowColor = 'rgb(227, 11, 92)'; // --glow-spread-color

    // Add a smaller inner rectangle with lighter color for inner glow effect
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    const padding = this.width * 0.2;
    this.ctx.fillRect(
      this.x + padding / 2,
      this.y + padding / 2,
      this.width - padding,
      this.height - padding,
    );

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
