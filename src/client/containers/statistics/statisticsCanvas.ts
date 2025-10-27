export class StatsCanvas {
  private ctx_race: CanvasRenderingContext2D;
  private ctx_pong: CanvasRenderingContext2D;
  public raf: number | null;

  constructor(
    ctx_race: CanvasRenderingContext2D,
    ctx_pong: CanvasRenderingContext2D,
  ) {
    this.ctx_pong = ctx_pong;
    this.ctx_race = ctx_race;
    this.raf = null;
  }

  loop(): void {
    this.raceBand();
    this.pongBand();
    requestAnimationFrame(() => this.loop());
  }

  raceBand(): void {
    const ctx = this.ctx_race;
    const canvas = ctx.canvas;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context state
    ctx.save();

    // Move to center and rotate 90 degrees
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(Math.PI / 2); // 90 degrees

    // Now draw as if it's horizontal (but it will appear vertical)
    const virtualWidth = canvas.height; // Swapped dimensions
    const virtualHeight = canvas.width;

    // Draw race track elements vertically
    this.drawRaceTrack(ctx, virtualWidth, virtualHeight);

    // Restore context state
    ctx.restore();
  }

  pongBand(): void {
    const ctx = this.ctx_pong;
    const canvas = ctx.canvas;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Save context state
    ctx.save();

    // Move to center and rotate 90 degrees
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(Math.PI / 2); // 90 degrees

    // Now draw as if it's horizontal (but it will appear vertical)
    const virtualWidth = canvas.height; // Swapped dimensions
    const virtualHeight = canvas.width;

    // Draw pong elements vertically
    this.drawPongGame(ctx, virtualWidth, virtualHeight);

    // Restore context state
    ctx.restore();
  }

  private drawRaceTrack(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    // Draw race track background
    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(-width / 2, -height / 2, width, height);

    // Draw road stripes (now they'll be horizontal when rotated)
    ctx.strokeStyle = '#ffff44';
    ctx.lineWidth = 2;
    ctx.setLineDash([10, 15]);

    // Center line
    ctx.beginPath();
    ctx.moveTo(-width / 2, 0);
    ctx.lineTo(width / 2, 0);
    ctx.stroke();

    // Side lines
    ctx.setLineDash([]);
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#ffffff';

    ctx.beginPath();
    ctx.moveTo(-width / 2, -height / 3);
    ctx.lineTo(width / 2, -height / 3);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-width / 2, height / 3);
    ctx.lineTo(width / 2, height / 3);
    ctx.stroke();

    // Add animated car
    const time = Date.now() * 0.0015;
    const bleuCarX = -Math.sin(time) * (width / 2);
    const bleuCarY = -21;

    ctx.fillStyle = '#5744ffff';
    ctx.fillRect(bleuCarX - 10, bleuCarY - 5, 20, 10);

    // Car details
    ctx.fillStyle = '#000000';
    ctx.fillRect(bleuCarX - 8, bleuCarY - 3, 16, 6); // Body
    ctx.fillStyle = '#333333';
    ctx.fillRect(bleuCarX - 10, bleuCarY - 2, 4, 4); // Wheels
    ctx.fillRect(bleuCarX + 6, bleuCarY - 2, 4, 4);

    // Add animated car
    const redCarX = Math.sin(time) * (width / 2);
    const redCarY = 21;

    ctx.fillStyle = '#ff4444';
    ctx.fillRect(redCarX - 10, redCarY - 5, 20, 10);

    // Car details
    ctx.fillStyle = '#000000';
    ctx.fillRect(redCarX - 8, redCarY - 3, 16, 6); // Body
    ctx.fillStyle = '#333333';
    ctx.fillRect(redCarX - 10, redCarY - 2, 4, 4); // Wheels
    ctx.fillRect(redCarX + 6, redCarY - 2, 4, 4);
  }

  private drawPongGame(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ): void {
    // Draw pong background
    const gradient = ctx.createLinearGradient(
      -width / 2,
      -height / 2,
      width / 2,
      height / 2,
    );
    gradient.addColorStop(0, 'rgba(255, 105, 180, 0.1)');
    gradient.addColorStop(0.5, 'rgba(255, 20, 147, 0.05)');
    gradient.addColorStop(1, 'rgba(255, 105, 180, 0.1)');

    ctx.fillStyle = gradient;
    ctx.fillRect(-width / 2, -height / 2, width, height);

    // Draw center line (dashed)
    ctx.strokeStyle = '#ff69b4';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 10]);

    ctx.beginPath();
    ctx.moveTo(0, -height / 2);
    ctx.lineTo(0, height / 2);
    ctx.stroke();

    // Reset line dash
    ctx.setLineDash([]);

    // Animated paddles
    const time = Date.now() * 0.003;
    const leftPaddleY = Math.sin(time) * (height / 4);
    const rightPaddleY = Math.sin(time + Math.PI) * (height / 4);

    const paddleWidth = 8;
    const paddleHeight = height / 6;

    // Left paddle
    ctx.fillStyle = '#ff69b4';
    ctx.fillRect(
      -width / 2 + 10,
      leftPaddleY - paddleHeight / 2,
      paddleWidth,
      paddleHeight,
    );

    // Right paddle
    ctx.fillRect(
      width / 2 - 10 - paddleWidth,
      rightPaddleY - paddleHeight / 2,
      paddleWidth,
      paddleHeight,
    );

    // Animated ball
    const ballX = Math.sin(time * 0.7) * (width / 2.5);
    const ballY = Math.cos(time * 1) * (height / 2.7);
    const ballRadius = 8;

    // Ball glow effect
    const ballGradient = ctx.createRadialGradient(
      ballX,
      ballY,
      0,
      ballX,
      ballY,
      ballRadius * 2,
    );
    ballGradient.addColorStop(0, '#ffffff');
    ballGradient.addColorStop(0.7, '#ff69b4');
    ballGradient.addColorStop(1, 'transparent');

    ctx.fillStyle = ballGradient;
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius * 2, 0, Math.PI * 2);
    ctx.fill();

    // Ball core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fill();
  }
}
