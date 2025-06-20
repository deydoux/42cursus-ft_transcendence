export class Track {
  private readonly ctx: CanvasRenderingContext2D;

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }

  public draw(): void {
    const width = this.ctx.canvas.width;
    const height = this.ctx.canvas.height;

    // Draw field background
    this.ctx.fillStyle = '#0a0a0a'; // Darker background for better neon contrast
    this.ctx.fillRect(0, 0, width, height);

    // Draw neon grid
    this.drawNeonGrid(width, height);
  }

  private drawNeonGrid(width: number, height: number): void {
    // Calculate grid spacing to fit the canvas nicely
    const gridSpacing = Math.min(width, height) / 8; // Adjust divisor to control grid density

    // Set up neon blue styling
    this.ctx.strokeStyle = '#041dbfc7'; // Bright neon blue
    this.ctx.lineWidth = 4;
    this.ctx.shadowColor = '#00d4ff'; // Glow color
    this.ctx.shadowBlur = 10; // Glow intensity
    this.ctx.globalCompositeOperation = 'screen'; // Blend mode for glow effect

    // Draw vertical lines
    for (let x = gridSpacing; x < width; x += gridSpacing) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
    }

    // Draw horizontal lines
    for (let y = gridSpacing; y < height; y += gridSpacing) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }

    // Add a second pass for extra glow
    this.ctx.shadowBlur = 20;
    this.ctx.strokeStyle = '#0088cc'; // Slightly darker blue for depth
    this.ctx.lineWidth = 2;

    // Draw vertical lines (second pass)
    for (let x = gridSpacing; x < width; x += gridSpacing) {
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
    }

    // Draw horizontal lines (second pass)
    for (let y = gridSpacing; y < height; y += gridSpacing) {
      this.ctx.beginPath();
      this.ctx.moveTo(0, y);
      this.ctx.lineTo(width, y);
      this.ctx.stroke();
    }

    // Reset canvas state
    this.ctx.shadowBlur = 0;
    this.ctx.globalCompositeOperation = 'source-over';
  }
}
