import {Checkpoint} from '../containers/checkpoint';
import {RaceGame} from '../utils/race-content';

export class RaceCanvas {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private race: RaceGame;
  private raf: number;
  private dpr: number;
  private color = '#fde';

  constructor(canvas: HTMLCanvasElement, race: RaceGame) {
    this.raf = 0;
    this.race = race;
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Failed to get canvas context');
    }
    this.ctx = context;
    this.dpr = window.devicePixelRatio || 1;
  }

  public startGame(): void {
    console.log('Starting game...'); // Debug log
    if (this.raf) {
      cancelAnimationFrame(this.raf); // Cancel any existing loop
    }
    this.race.gameStarted = true; // Ensure game is marked as started
    this.gameLoop(); // Start the game loop
  }

  public displayStartMessage(): void {
    this.race.announcement.innerText = `Good luck ${this.race.car1.name} and ${this.race.car2.name}!`;

    this.ctx.save();

    const width = this.canvas.width;
    const height = this.canvas.height;
    const baseFontSize = Math.max(width, height) * 0.025 * this.dpr;
    const smallFontSize = baseFontSize * 0.5;
    const lineHeight = smallFontSize * 1.25;

    // Calculate total height of the block (title + ascii art)
    const titleHeight = baseFontSize;
    const totalBlockHeight = titleHeight + lineHeight; // extra lineHeight for spacing

    // Center of canvas
    const centerX = width / 2;
    const centerY = height / 2;

    // Start drawing so that the block is vertically centered
    const currentY = centerY - totalBlockHeight / 2 + titleHeight / 2;

    this.ctx.font = `bold ${baseFontSize}px monospace`;
    this.ctx.fillStyle = this.color;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = 'rgba(191, 123, 255, 0.781)';
    this.ctx.fillText(
      'Press the button to start/play again!',
      centerX,
      currentY,
    );

    this.ctx.restore();
  }

  private gameLoop(): void {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if (!this.race.gameStarted) {
      this.displayStartMessage();
      return;
    }

    // Update checkpoint position every 10 seconds
    const currentTime = Date.now();
    if (currentTime - this.race.lastCheckpointTime > 10000) {
      this.race.currentCheckpoint = new Checkpoint(this.ctx);
      this.race.lastCheckpointTime = currentTime;
    }

    // Check for collisions
    if (this.race.currentCheckpoint.isColliding(this.race.car1)) {
      this.race.car1Score++;
      this.updateScore();
    }
    if (this.race.currentCheckpoint.isColliding(this.race.car2)) {
      this.race.car2Score++;
      this.updateScore();
    }

    this.handleCarMovement();
    this.race.currentCheckpoint.draw();
    this.race.car1.draw();
    this.race.car2.draw();

    this.raf = requestAnimationFrame(this.gameLoop.bind(this));
  }

  private handleCarMovement() {
    // Move cars based on current key states
    if (this.race.gameStarted) {
      // Car 1 movement
      this.race.car1.move(
        this.race.keys.w,
        (this.race.keys.d ? 1 : 0) - (this.race.keys.a ? 1 : 0),
      );

      // Car 2 movement
      this.race.car2.move(
        this.race.keys.ArrowUp,
        (this.race.keys.ArrowRight ? 1 : 0) -
          (this.race.keys.ArrowLeft ? 1 : 0),
      );
    }
  }

  private updateScore(): void {
    if (this.race.announcement) {
      this.race.announcement.innerText = `Score - ${this.race.car1.name}: ${this.race.car1Score} | ${this.race.car2.name}: ${this.race.car2Score}`;
    }
  }
}
