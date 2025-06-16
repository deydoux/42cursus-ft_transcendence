import {Checkpoint} from '../containers/checkpoint';
import {Growpoint} from '../containers/growpoint';
import {Particle} from '../containers/particle';
import {RaceGame} from '../utils/race-content';
import {Slowpoint} from '../containers/slowpoint';

export class RaceCanvas {
  private ctx: CanvasRenderingContext2D;
  private race: RaceGame;
  private raf: number | null;
  private dpr: number;
  private color = '#fde';

  constructor(race: RaceGame) {
    this.raf = null;
    this.race = race;
    this.ctx = race.ctx;
    this.dpr = window.devicePixelRatio || 1;
  }

  public startGame(): void {
    console.log('Starting game...'); // Debug log
    if (this.raf) {
      cancelAnimationFrame(this.raf); // Cancel any existing loop
    }
    this.race.gameStarted = true; // Ensure game is marked as started
    this.race.timer.start(); // Start the timer
    this.gameLoop(); // Start the game loop
  }

  public displayStartMessage(): void {
    this.race.announcement.innerText = `Good luck ${this.race.car1.name} and ${this.race.car2.name}!`;

    this.ctx.save();

    const width = this.ctx.canvas.width;
    const height = this.ctx.canvas.height;
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
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    if (!this.race.gameStarted) {
      this.displayStartMessage();
      return;
    }

    if (this.race.timer.isTimeUp()) {
      this.endGame();
      return;
    }
    this.displayTimer();

    // handle game logic
    this.handlePointsSpawning();
    this.handleCollision();
    this.handleCarMovement();

    // Draw game elements
    this.race.track.draw();
    this.race.walls.draw();
    if (this.race.currentCheckpoint) {
      this.race.currentCheckpoint.draw();
    }
    if (this.race.currentGrowpoint) {
      this.race.currentGrowpoint.draw();
    }
    if (this.race.currentSlowpoint) {
      this.race.currentSlowpoint.draw();
    }
    this.race.car1.draw();
    this.race.car2.draw();

    this.updateParticles();

    this.raf = requestAnimationFrame(this.gameLoop.bind(this));
  }

  private handleCarMovement(): void {
    if (this.race.gameStarted) {
      // Car 1 (W forward, S backward)
      this.race.car1.move(
        this.race.keys.w ? true : this.race.keys.s ? false : null,
        (this.race.keys.d ? 1 : 0) - (this.race.keys.a ? 1 : 0),
        this.race.walls,
      );

      // Car 2 (Up forward, Down backward)
      this.race.car2.move(
        this.race.keys.ArrowUp ? true : this.race.keys.ArrowDown ? false : null,
        (this.race.keys.ArrowRight ? 1 : 0) -
          (this.race.keys.ArrowLeft ? 1 : 0),
        this.race.walls,
      );
    }
  }

  /**
   * Updates the score display
   */
  private updateScore(): void {
    if (this.race.announcement) {
      this.race.announcement.innerText = `Score - ${this.race.car1.name}: ${this.race.car1Score} | ${this.race.car2.name}: ${this.race.car2Score}`;
    }
  }

  /**
   * Handles the spawning and management of checkpoints, growpoints, and slowpoints.
   * Checkpoints are updated every 10 seconds, growpoints every 50 seconds,
   * and slowpoints are created randomly.
   */
  private handlePointsSpawning(): void {
    const currentTime = Date.now();

    // Update checkpoint position every 10 seconds
    if (currentTime - this.race.lastCheckpointTime > 10000) {
      this.race.currentCheckpoint = Checkpoint.createRandomCheckpoint(
        this.ctx,
        this.race.walls,
      );
      this.race.lastCheckpointTime = currentTime;
    }

    // Handle growpoint spawning every 50 seconds
    if (currentTime - this.race.lastGrowpointTime > 50000) {
      this.race.currentGrowpoint = Growpoint.createRandomGrowpoint(
        this.ctx,
        this.race.walls,
      );
      this.race.lastGrowpointTime = currentTime;
    }

    // Clear growpoint after 10 seconds
    if (currentTime - this.race.lastGrowpointTime > 10000) {
      this.race.currentGrowpoint = null;
    }

    // Handle slowpoint spawning every 30 seconds
    if (currentTime - this.race.lastSlowpointTime > 30000) {
      this.race.currentSlowpoint = Slowpoint.createRandomSlowpoint(
        this.ctx,
        this.race.walls,
      );
      this.race.lastSlowpointTime = currentTime;
    }

    // Clear Slowpoint after 10 seconds
    if (currentTime - this.race.lastSlowpointTime > 10000) {
      this.race.currentSlowpoint = null;
    }
  }

  /**
   * Handles collisions between cars and checkpoints, growpoints, and slowpoints.
   * Increments score for checkpoint collisions, increases car size for growpoint collisions,
   * and slows down the opposing car for slowpoint collisions.
   */
  private handleCollision(): void {
    //checkpoint collision -> increment score
    if (
      this.race.currentCheckpoint &&
      this.race.currentCheckpoint.isColliding(this.race.car1)
    ) {
      this.createPopEffect(this.race.car1.x, this.race.car1.y, '#00ff00');
      this.race.currentCheckpoint = null;
      this.race.car1Score += 2;
      this.updateScore();
    }
    if (
      this.race.currentCheckpoint &&
      this.race.currentCheckpoint.isColliding(this.race.car2)
    ) {
      this.createPopEffect(this.race.car2.x, this.race.car2.y, '#00ff00');
      this.race.currentCheckpoint = null;
      this.race.car2Score += 2;
      this.updateScore();
    }
    //growpoint collision -> increases car size
    if (
      this.race.currentGrowpoint &&
      this.race.currentGrowpoint.isColliding(this.race.car1)
    ) {
      this.createPopEffect(this.race.car1.x, this.race.car1.y, '#ff00ff');
      this.race.currentGrowpoint = null; // Clear growpoint after collision
      this.race.car1.carWidth += 5;
      this.race.car1.carHeight += 5;
      this.race.lastGrowpointTime = Date.now() - 45000;
    }
    if (
      this.race.currentGrowpoint &&
      this.race.currentGrowpoint.isColliding(this.race.car2)
    ) {
      this.createPopEffect(this.race.car2.x, this.race.car2.y, '#ff00ff');
      this.race.currentGrowpoint = null; // Clear growpoint after collision
      this.race.car2.carWidth += 5;
      this.race.car2.carHeight += 5;
      this.race.lastGrowpointTime = Date.now() - 45000;
    }
    //slowpoint collision -> slows down opposant's car
    if (
      this.race.currentSlowpoint &&
      this.race.currentSlowpoint.isColliding(this.race.car2)
    ) {
      this.createPopEffect(this.race.car2.x, this.race.car2.y, '#ff0000');
      this.race.currentSlowpoint = null; // Clear slowpoint after collision
      this.race.car1.speed *= 0.5; // Slow down car 1
      this.race.lastSlowpointTime = Date.now();
    }
    if (
      this.race.currentSlowpoint &&
      this.race.currentSlowpoint.isColliding(this.race.car1)
    ) {
      this.createPopEffect(this.race.car1.x, this.race.car1.y, '#ff0000');
      this.race.currentSlowpoint = null; // Clear slowpoint after collision
      this.race.car2.speed *= 0.5; // Slow down car 2
      this.race.lastSlowpointTime = Date.now();
    }
  }

  private particles: Particle[] = [];

  private createPopEffect(x: number, y: number, color: string): void {
    for (let i = 0; i < 12; i++) {
      this.particles.push(new Particle(this.ctx, x, y, color));
    }
  }

  private updateParticles(): void {
    this.particles = this.particles.filter(particle => {
      const isAlive = particle.update();
      if (isAlive) {
        particle.draw();
      }
      return isAlive;
    });
  }
  private displayTimer(): void {
    const time = this.race.timer.formatTime(this.race.timer.getRemainingTime());
    this.ctx.save();
    this.ctx.font = '24px Arial';
    this.ctx.fillStyle = '#fff';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(time, this.ctx.canvas.width / 2, 30);
    this.ctx.restore();
  }

  private endGame(): void {
    this.race.gameStarted = false;
    this.race.timer.stop();
  }
}
