import {Car} from './car';
import {Checkpoint} from './checkpoint';
import {Growpoint} from './growpoint';
import {RaceGame} from '../../utils/race-content';
import {Slowpoint} from './slowpoint';
import {displayCountdownMessage} from '../../utils/content';
export class RaceCanvas {
  private ctx: CanvasRenderingContext2D;
  private race: RaceGame;
  private raf: number | null;
  private color = 'rgb(255, 255, 255)';

  constructor(race: RaceGame) {
    this.raf = null;
    this.race = race;
    this.ctx = race.ctx;
  }

  /**
   * Starts the game loop and initializes
   */
  public startGame(): void {
    this.race.timer.startCountdown();
    this.raf = window.requestAnimationFrame(this.gameLoop.bind(this));
  }

  /**
   * Displays a start message on the canvas
   */
  public displayStartMessage(): void {
    this.updateScore();

    this.ctx.save();

    const width = this.ctx.canvas.width;
    const height = this.ctx.canvas.height;
    const baseFontSize = Math.max(width, height) * 0.025;
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
    this.ctx.fillText(
      'Click on the button to start the game!',
      centerX,
      currentY,
    );

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
      this.race.timer.stop();
      this.endGame();
      console.log('Time is up! Ending game.');
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

    this.race.car1.draw();
    this.race.car2.draw();

    if (countdownMessage) {
      displayCountdownMessage(this.ctx, this.color, countdownMessage);
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
    if (this.race.scores) {
      this.race.scores.innerText = `${this.race.car1.name}: ${this.race.car1.score} | ${this.race.car2.name}: ${this.race.car2.score}`;
    }
    if (this.race.timerDisplay) {
      this.race.timerDisplay.innerText = `${this.race.timer.getRemainingTimeFormatted()}`;
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
        this.updateScore();
        return false; // Remove checkpoint
      }

      if (car2Collision) {
        this.race.car2.score += 2; // Add points for car2
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
      this.race.currentGrowpoint = null; // Clear growpoint after collision
      this.race.car1.applyCarGrowth();
      this.race.lastGrowpointTime = Date.now() - 45000;
    }
    if (
      this.race.currentGrowpoint &&
      this.race.currentGrowpoint.isColliding(this.race.car2) &&
      !this.race.car2.isBigger
    ) {
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
      this.race.currentSlowpoint = null; // Clear slowpoint after collision
      this.race.car1.applySlowdown();
      this.race.lastSlowpointTime = Date.now();
    }
    if (
      this.race.currentSlowpoint &&
      this.race.currentSlowpoint.isColliding(this.race.car1) &&
      !this.race.car2.isSlowed
    ) {
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

    if (isColliding) {
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
   * Checks if each car is colliding with walls and resets their position if they are stuck.
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
    this.race.walls.isCarColliding(car1Position);
    this.race.walls.isCarColliding(car2Position);
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
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`⏱️ ${time}`, 20, 30);
    this.ctx.restore();
  }

  /**
   * Ends the game by stopping the timer and setting gameStarted to false.
   * This method is called when the time is up.
   */
  private endGame(): void {
    this.drawGameOverScreen();
    this.race.car1.score = 0;
    this.race.car2.score = 0;
    this.updateScore();
    this.race.timer.reset();
    this.race.gameStarted = false;
  }

  public drawGameOverScreen(): void {
    // Semi-transparent overlay
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    const centerX = this.ctx.canvas.width / 2;
    const centerY = this.ctx.canvas.height / 2;

    // Determine winner, loser, or tie
    const isTie = this.race.car1.score === this.race.car2.score;
    const winner =
      this.race.car1.score > this.race.car2.score
        ? this.race.car1
        : this.race.car2;
    const loser =
      this.race.car1.score > this.race.car2.score
        ? this.race.car2
        : this.race.car1;

    // Catch phrase at the top
    this.ctx.fillStyle = '#FFD700'; // Gold color
    this.ctx.font = 'bold 96px Arial';
    this.ctx.textAlign = 'center';

    if (isTie && this.race.car1.score === 0) {
      this.ctx.fillText(
        'PERFECT TIE...But no one played',
        centerX,
        centerY - 400,
      );
      // Secondary text for tie
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = 'bold 48px Arial';
      this.ctx.fillText(
        'Was it too hard for the both of you?',
        centerX,
        centerY - 320,
      );
    } else if (isTie) {
      this.ctx.fillText('🤝 PERFECT TIE! 🤝', centerX, centerY - 400);
      // Secondary text for tie
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = 'bold 48px Arial';
      this.ctx.fillText('Champions Share the Glory!', centerX, centerY - 320);
    } else {
      this.ctx.fillText('🏁 RACE COMPLETE! 🏁', centerX, centerY - 400);
      // Secondary text for winner
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.font = 'bold 48px Arial';
      this.ctx.fillText(
        'The Checkered Flag Has Fallen!',
        centerX,
        centerY - 320,
      );
    }

    // Draw podium base with dynamic heights
    this.drawPodium(
      centerX,
      centerY,
      this.race.car1.score,
      this.race.car2.score,
      isTie,
    );

    if (isTie && this.race.car1.score === 0) {
      // Both cars on same height podiums
      this.drawCarOnPodium(this.race.car1, centerX - 160, centerY - 40, false);
      this.drawCarOnPodium(this.race.car2, centerX + 160, centerY - 40, false);
    } else if (isTie) {
      // Both cars on same height podiums
      this.drawCarOnPodium(this.race.car1, centerX - 160, centerY - 40, true);
      this.drawCarOnPodium(this.race.car2, centerX + 160, centerY - 40, true);
    } else {
      // Draw cars on podium with better positioning
      this.drawCarOnPodium(winner, centerX - 160, centerY - 60, true); // Winner higher up
      this.drawCarOnPodium(loser, centerX + 160, centerY + 20, false); // Loser positioned better
    }

    // Draw position numbers with adjusted positions
    this.drawPositionNumbers(centerX, centerY, isTie);

    // Draw scores with more spacing
    this.drawScores(winner, loser, centerX, centerY, isTie);

    // Draw restart instruction
    this.ctx.fillStyle = '#CCCCCC';
    this.ctx.font = '40px Arial';
    this.ctx.fillText(
      'Click the button to Race Again!',
      centerX,
      centerY + 400,
    ); // Moved down
  }

  private drawPodium(
    centerX: number,
    centerY: number,
    car1Score: number,
    car2Score: number,
    isTie: boolean,
  ): void {
    // Podium colors
    const goldColor = '#FFD700';
    const silverColor = '#C0C0C0';

    this.ctx.save();

    if (isTie && car1Score === 0) {
      // Both podiums same height (silver)
      console.log('Both cars have 0 score, drawing silver podiums');
      const tieHeight = 100;
      const yPosition = centerY - 10;

      // Left podium (Car 1)
      this.ctx.fillStyle = silverColor;
      this.ctx.fillRect(centerX - 240, yPosition, 160, tieHeight);
      this.ctx.strokeStyle = '#A0A0A0';
      this.ctx.lineWidth = 6;
      this.ctx.strokeRect(centerX - 240, yPosition, 160, tieHeight);

      // Right podium (Car 2)
      this.ctx.fillStyle = silverColor;
      this.ctx.fillRect(centerX + 80, yPosition, 160, tieHeight);
      this.ctx.strokeStyle = '#A0A0A0';
      this.ctx.lineWidth = 6;
      this.ctx.strokeRect(centerX + 80, yPosition, 160, tieHeight);
    } else if (isTie) {
      // Both podiums same height (gold)
      const tieHeight = 140;
      const yPosition = centerY - 10;

      // Left podium (Car 1)
      this.ctx.fillStyle = goldColor;
      this.ctx.fillRect(centerX - 240, yPosition, 160, tieHeight);
      this.ctx.strokeStyle = '#B8860B';
      this.ctx.lineWidth = 6;
      this.ctx.strokeRect(centerX - 240, yPosition, 160, tieHeight);

      // Right podium (Car 2)
      this.ctx.fillStyle = goldColor;
      this.ctx.fillRect(centerX + 80, yPosition, 160, tieHeight);
      this.ctx.strokeStyle = '#B8860B';
      this.ctx.lineWidth = 6;
      this.ctx.strokeRect(centerX + 80, yPosition, 160, tieHeight);
    } else {
      // Calculate dynamic heights based on scores
      const maxScore = Math.max(car1Score, car2Score);
      const minScore = Math.min(car1Score, car2Score);

      // Base height and scaling - reduced max height for better spacing
      const baseHeight = 80;
      const maxHeight = 160; // Reduced from 200
      const heightScale =
        maxScore > 0 ? (maxHeight - baseHeight) / maxScore : 0;

      // Calculate heights (minimum base height + proportional to score)
      const winnerHeight = baseHeight + maxScore * heightScale;
      const loserHeight = baseHeight + minScore * heightScale;

      // Winner podium (higher score) - left side
      this.ctx.fillStyle = goldColor;
      const winnerY = centerY + 120 - winnerHeight; // Adjusted base position
      this.ctx.fillRect(centerX - 240, winnerY, 160, winnerHeight);
      this.ctx.strokeStyle = '#B8860B';
      this.ctx.lineWidth = 6;
      this.ctx.strokeRect(centerX - 240, winnerY, 160, winnerHeight);

      // Loser podium (lower score) - right side
      this.ctx.fillStyle = silverColor;
      const loserY = centerY + 120 - loserHeight; // Adjusted base position
      this.ctx.fillRect(centerX + 80, loserY, 160, loserHeight);
      this.ctx.strokeStyle = '#A0A0A0';
      this.ctx.lineWidth = 6;
      this.ctx.strokeRect(centerX + 80, loserY, 160, loserHeight);
    }

    this.ctx.restore();
  }

  private drawCarOnPodium(
    car: Car,
    x: number,
    y: number,
    isWinner: boolean,
  ): void {
    this.ctx.save();
    this.ctx.translate(x, y);

    // Scale down the car for podium display
    const scale = 1.2; // Slightly smaller for better fit
    this.ctx.scale(scale, scale);

    // Draw car
    if (car.carImage && car.imageLoaded) {
      this.ctx.drawImage(
        car.carImage,
        -car.carWidth / 2,
        -car.carHeight / 2,
        car.carWidth,
        car.carHeight,
      );
    } else {
      // Fallback rectangle
      this.ctx.fillStyle = car.color;
      this.ctx.fillRect(
        -car.carWidth / 2,
        -car.carHeight / 2,
        car.carWidth,
        car.carHeight,
      );
    }

    // Winner crown/effect
    if (isWinner) {
      this.ctx.fillStyle = '#FFD700';
      this.ctx.font = 'bold 60px Arial';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('👑', 0, -car.carHeight / 2 - 40);
    }

    this.ctx.restore();
  }

  private drawPositionNumbers(
    centerX: number,
    centerY: number,
    isTie: boolean,
  ): void {
    this.ctx.save();
    this.ctx.font = 'bold 72px Arial';
    this.ctx.textAlign = 'center';

    if (isTie && this.race.car1.score === 0) {
      return; // No positions to draw if both scores are 0
    } else if (isTie) {
      // Both positions show "1" for tie
      this.ctx.fillStyle = '#FFD700';
      this.ctx.strokeStyle = '#B8860B';
      this.ctx.lineWidth = 4;
      this.ctx.fillText('1', centerX - 160, centerY + 110);
      this.ctx.strokeText('1', centerX - 160, centerY + 110);
      this.ctx.fillText('1', centerX + 160, centerY + 110);
      this.ctx.strokeText('1', centerX + 160, centerY + 110);
    } else {
      // 1st place
      this.ctx.fillStyle = '#FFD700';
      this.ctx.strokeStyle = '#B8860B';
      this.ctx.lineWidth = 4;
      this.ctx.fillText('1', centerX - 160, centerY + 100);
      this.ctx.strokeText('1', centerX - 160, centerY + 100);

      // 2nd place - better positioned
      this.ctx.fillStyle = '#C0C0C0';
      this.ctx.strokeStyle = '#C0C0C0';
      this.ctx.lineWidth = 4;
      this.ctx.fillText('2', centerX + 160, centerY + 110);
      this.ctx.strokeText('2', centerX + 160, centerY + 110);
    }

    this.ctx.restore();
  }

  private drawScores(
    winner: Car,
    loser: Car,
    centerX: number,
    centerY: number,
    isTie: boolean,
  ): void {
    this.ctx.save();
    this.ctx.font = 'bold 36px Arial';
    this.ctx.textAlign = 'center';

    if (isTie) {
      // Both cars get gold treatment for tie unless the score is 0
      this.ctx.fillStyle = this.race.car1.score === 0 ? '#C0C0C0' : '#FFD700';
      this.ctx.fillText(`${this.race.car1.name}`, centerX - 160, centerY + 180);
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillText(
        `Score: ${this.race.car1.score}`,
        centerX - 160,
        centerY + 220,
      );

      this.ctx.fillStyle = this.race.car1.score === 0 ? '#C0C0C0' : '#FFD700';
      this.ctx.fillText(`${this.race.car2.name}`, centerX + 160, centerY + 180);
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillText(
        `Score: ${this.race.car2.score}`,
        centerX + 160,
        centerY + 220,
      );

      // Tie message
      this.ctx.fillStyle = '#FFFF00';
      this.ctx.font = '32px Arial';
      this.ctx.fillText(
        'next time try to catch something 😒?',
        centerX,
        centerY + 280,
      );
    } else {
      // Winner score - better spacing
      this.ctx.fillStyle = '#FFD700';
      this.ctx.fillText(`${winner.name}`, centerX - 160, centerY + 170);
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillText(`Score: ${winner.score}`, centerX - 160, centerY + 210);

      // Loser score - more space below car
      this.ctx.fillStyle = '#C0C0C0';
      this.ctx.fillText(`${loser.name}`, centerX + 160, centerY + 180);
      this.ctx.fillStyle = '#FFFFFF';
      this.ctx.fillText(`Score: ${loser.score}`, centerX + 160, centerY + 220);

      // Score difference
      const scoreDiff = Math.abs(winner.score - loser.score);
      this.ctx.fillStyle = '#FFFF00';
      this.ctx.font = '32px Arial';
      this.ctx.fillText(
        `Victory Margin: ${scoreDiff} points`,
        centerX,
        centerY + 280,
      );
    }

    this.ctx.restore();
  }
}
