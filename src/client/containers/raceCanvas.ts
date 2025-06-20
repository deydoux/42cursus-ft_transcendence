import {Car} from './car';
import {Checkpoint} from './checkpoint';
import {Growpoint} from './growpoint';
import {Particle} from './particle';
import {RaceGame} from '../utils/race-content';
import {Slowpoint} from './slowpoint';

export class RaceCanvas {
  private ctx: CanvasRenderingContext2D;
  private race: RaceGame;
  private raf: number | null;
  private dpr: number;
  private color = 'rgb(221, 232, 255)';
  private particles: Particle[] = [];

  constructor(race: RaceGame) {
    this.raf = null;
    this.race = race;
    this.ctx = race.ctx;
    this.dpr = window.devicePixelRatio || 1;
  }

  /**
   * Starts the game loop and initializes
   */
  public startGame(): void {
    if (this.raf) {
      cancelAnimationFrame(this.raf); // Cancel any existing loop
    }

    this.race.timer.startCountdown();
    this.race.gameStarted = true;

    this.gameLoop();
  }

  /**
   * Displays a countdown message on the canvas
   * @param message The countdown message to display
   */
  private displayCountdownMessage(message: string): void {
    this.ctx.save();

    const width = this.ctx.canvas.width;
    const height = this.ctx.canvas.height;
    const baseFontSize = Math.max(width, height) * 0.08 * this.dpr; // Larger font for countdown

    // Center of canvas
    const centerX = width / 2;
    const centerY = height / 2;

    this.ctx.font = `bold ${baseFontSize}px monospace`;
    this.ctx.fillStyle = message === 'GO!' ? '#00ff00' : this.color; // Green for GO!, regular color for numbers
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.shadowBlur = 20;
    this.ctx.shadowColor =
      message === 'GO!' ? 'rgba(0, 255, 0, 0.8)' : 'rgba(40, 60, 189, 0.78)';

    this.ctx.fillText(message, centerX, centerY);

    this.ctx.restore();
  }

  /**
   * Displays a start message on the canvas
   */
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
    this.ctx.shadowColor = 'rgba(40, 60, 189, 0.78)';
    this.ctx.fillText('Press the button to start the game!', centerX, currentY);

    this.ctx.restore();
  }

  /**
   * Main game loop that updates the canvas
   * Handles game logic, rendering, and animations.
   * It also handles the countdown and game start logic.
   * If the game is not started, it displays a start message.
   * If the game is started, it updates the game state, handles collisions,
   * and draws all game elements including the track, walls, checkpoints, growpoints, slowpoints, and cars.
   * It also manages the particles for visual effects.
   * If the countdown is active, it displays the countdown message.
   * If the time is up, it ends the game and stops the timer.
   * This method is called recursively using requestAnimationFrame to create a smooth animation loop.
   */
  private gameLoop(): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    if (!this.race.gameStarted) {
      this.displayStartMessage();
      return;
    }

    this.displayTimer();
    // Check if countdown is active
    const isCountdownActive = this.race.timer.isCountdownActive();
    const countdownMessage = this.race.timer.getCountdownMessage();

    // Only start the timer when countdown is finished
    if (!isCountdownActive && !this.race.timer.isRunning) {
      this.race.timer.start();
      this.race.lastCheckpointTime = Date.now();
      this.race.lastGrowpointTime = Date.now();
      this.race.lastSlowpointTime = Date.now();
    }

    // Check if time is up (only if timer has started)
    if (this.race.timer.isRunning && this.race.timer.isTimeUp()) {
      this.endGame();
      return;
    }

    // handle game logic
    if (!isCountdownActive) {
      this.handlePointsSpawning();
      this.handleStuckCars();
      this.handlePointsCollision();
      this.handleCarMovement();
      this.updateScore();
      this.handleCarCollisions();
    }

    // Draw game elements
    this.race.track.draw();
    this.race.walls.draw();

    if (!isCountdownActive) {
      this.race.checkpoints.forEach(checkpoint => {
        checkpoint.draw();
      });
      if (this.race.currentGrowpoint) {
        this.race.currentGrowpoint.draw();
      }
      if (this.race.currentSlowpoint) {
        this.race.currentSlowpoint.draw();
      }
    }
    this.updateParticles();

    this.race.car1.draw();
    this.race.car2.draw();

    if (countdownMessage) {
      this.displayCountdownMessage(countdownMessage);
    }

    this.raf = requestAnimationFrame(this.gameLoop.bind(this));
  }

  /**
   * Handles car movement based on user input
   * Moves car1 with W/S keys and car2 with ArrowUp/ArrowDown keys
   * Also handles left/right movement for both cars
   */
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
      this.race.announcement.innerText = `${this.race.car1.name}: ${this.race.car1.score} | ${this.race.car2.name}: ${this.race.car2.score} \n ${this.race.timer.getRemainingTimeFormatted()}`;
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
    if (
      this.race.lastCheckpointTime &&
      currentTime - this.race.lastCheckpointTime > 10000
    ) {
      const newCheckpoint = Checkpoint.createRandomCheckpoint(
        this.ctx,
        this.race.walls,
        this.race.checkpoints, // Pass existing checkpoints to avoid overlap
      );
      this.race.checkpoints.push(newCheckpoint);
      this.race.lastCheckpointTime = currentTime;
    }

    // Handle growpoint spawning every 30 seconds
    if (
      this.race.lastGrowpointTime &&
      currentTime - this.race.lastGrowpointTime > 30000
    ) {
      this.race.currentGrowpoint = Growpoint.createRandomGrowpoint(
        this.ctx,
        this.race.walls,
      );
      this.race.lastGrowpointTime = currentTime;
    }

    // Clear growpoint after 10 seconds
    if (
      this.race.lastGrowpointTime &&
      currentTime - this.race.lastGrowpointTime > 20000
    ) {
      this.race.currentGrowpoint = null;
    }

    // Handle slowpoint spawning every 30 seconds
    if (
      this.race.lastSlowpointTime &&
      currentTime - this.race.lastSlowpointTime > 30000
    ) {
      this.race.currentSlowpoint = Slowpoint.createRandomSlowpoint(
        this.ctx,
        this.race.walls,
      );
      this.race.lastSlowpointTime = currentTime;
    }

    // Clear Slowpoint after 20 seconds
    if (
      this.race.lastSlowpointTime &&
      currentTime - this.race.lastSlowpointTime > 20000
    ) {
      this.race.currentSlowpoint = null;
    }
  }

  /**
   * Handles collisions between cars and checkpoints, growpoints, and slowpoints.
   * Increments score for checkpoint collisions, increases car size for growpoint collisions,
   * and slows down the opposing car for slowpoint collisions.
   */
  private handlePointsCollision(): void {
    //checkpoint collision -> increment score
    this.race.checkpoints = this.race.checkpoints.filter(checkpoint => {
      const car1Collision = checkpoint.isColliding(this.race.car1);
      const car2Collision = checkpoint.isColliding(this.race.car2);

      if (car1Collision) {
        this.race.car1.score += 2; // Add points for car1
        this.createPopEffect(this.race.car1.x, this.race.car1.y, '#00ff00');
        this.updateScore();
        return false; // Remove checkpoint
      }

      if (car2Collision) {
        this.race.car2.score += 2; // Add points for car2
        this.createPopEffect(this.race.car2.x, this.race.car2.y, '#00ff00');
        this.updateScore();
        return false; // Remove checkpoint
      }

      return true; // Keep checkpoint
    });

    //growpoint collision -> increases car size
    if (
      this.race.currentGrowpoint &&
      this.race.currentGrowpoint.isColliding(this.race.car1) &&
      !this.race.car1.isBigger
    ) {
      this.createPopEffect(this.race.car1.x, this.race.car1.y, '#ff00ff');
      this.race.currentGrowpoint = null; // Clear growpoint after collision
      this.race.car1.applyCarGrowth();
      this.race.lastGrowpointTime = Date.now() - 45000;
    }
    if (
      this.race.currentGrowpoint &&
      this.race.currentGrowpoint.isColliding(this.race.car2) &&
      !this.race.car2.isBigger
    ) {
      this.createPopEffect(this.race.car2.x, this.race.car2.y, '#ff00ff');
      this.race.currentGrowpoint = null; // Clear growpoint after collision
      this.race.car2.applyCarGrowth();
      this.race.lastGrowpointTime = Date.now() - 45000;
    }
    //slowpoint collision -> slows down opposant's car
    if (
      this.race.currentSlowpoint &&
      this.race.currentSlowpoint.isColliding(this.race.car2) &&
      !this.race.car1.isSlowed
    ) {
      this.createPopEffect(this.race.car2.x, this.race.car2.y, '#ff0000');
      this.race.currentSlowpoint = null; // Clear slowpoint after collision
      this.race.car1.applySlowdown();
      this.race.lastSlowpointTime = Date.now();
    }
    if (
      this.race.currentSlowpoint &&
      this.race.currentSlowpoint.isColliding(this.race.car1) &&
      !this.race.car2.isSlowed
    ) {
      this.createPopEffect(this.race.car1.x, this.race.car1.y, '#ff0000');
      this.race.currentSlowpoint = null; // Clear slowpoint after collision
      this.race.car2.applySlowdown();
      this.race.lastSlowpointTime = Date.now();
    }
  }

  /**
   * Handles collisions between cars.
   * If cars collide, it checks which car is bigger and stops the smaller car.
   * It also creates a pop effect for visual feedback.
   */
  public handleCarCollisions(): void {
    const isColliding = this.race.car1.isCollidingWithCar(this.race.car2);
    console.log('Collision check:', isColliding); // Debug line

    if (isColliding) {
      console.log('Cars ARE colliding!');
      console.log('Car1 width:', this.race.car1.carWidth);
      console.log('Car2 width:', this.race.car2.carWidth);

      if (this.race.car1.carWidth > this.race.car2.carWidth) {
        this.race.car1.handleCarCollision(this.race.car2);
        this.race.car2.stopFor();
      } else if (this.race.car2.carWidth > this.race.car1.carWidth) {
        this.race.car2.handleCarCollision(this.race.car1);
        this.race.car1.stopFor();
      } else this.race.car2.handleCarCollision(this.race.car1);
    }
  }

  /**
   * Handles the case where cars are stuck in walls.
   * If a car is colliding with a wall, it creates a pop effect to indicate the collision.
   */
  private handleStuckCars(): void {
    const car1Position = {
      x: this.race.car1.x - this.race.car1.carWidth / 2,
      y: this.race.car1.y - this.race.car1.carHeight / 2,
      width: this.race.car1.carWidth,
      height: this.race.car1.carHeight,
    };

    const car2Position = {
      x: this.race.car2.x - this.race.car2.carWidth / 2,
      y: this.race.car2.y - this.race.car2.carHeight / 2,
      width: this.race.car2.carWidth,
      height: this.race.car2.carHeight,
    };

    if (this.race.walls.isCarColliding(car1Position)) {
      this.createPopEffect(this.race.car1.x, this.race.car1.y, '#ffffff');
    }

    if (this.race.walls.isCarColliding(car2Position)) {
      this.createPopEffect(this.race.car2.x, this.race.car2.y, '#ffffff');
    }
  }

  /**
   * Creates a pop effect at the specified position with the given color.
   * This is used for visual feedback when cars collide with points or walls.
   * @param x The x-coordinate of the pop effect
   * @param y The y-coordinate of the pop effect
   * @param color The color of the pop effect
   */
  private createPopEffect(x: number, y: number, color: string): void {
    for (let i = 0; i < 12; i++) {
      this.particles.push(new Particle(this.ctx, x, y, color));
    }
  }

  /**
   * Updates the particles on the canvas.
   * Filters out dead particles and draws the remaining ones.
   */
  private updateParticles(): void {
    this.particles = this.particles.filter(particle => {
      const isAlive = particle.update();
      if (isAlive) {
        particle.draw();
      }
      return isAlive;
    });
  }

  /**
   * Displays the timer on the canvas.
   * Formats the remaining time and displays it at the top center of the canvas.
   */
  private displayTimer(): void {
    const time = this.race.timer.formatTime(this.race.timer.getRemainingTime());
    this.ctx.save();
    this.ctx.font = '24px Arial';
    this.ctx.fillStyle = '#fff';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(time, this.ctx.canvas.width / 2, 30);
    this.ctx.restore();
  }

  /**
   * Ends the game by stopping the timer and setting gameStarted to false.
   * This method is called when the time is up.
   */
  private endGame(): void {
    this.race.gameStarted = false;
    this.race.timer.stop();
  }
}
