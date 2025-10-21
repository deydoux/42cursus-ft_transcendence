import {GameUIElement, IRaceGame} from '../../types/game';
import {Checkpoint} from './checkpoint';
import {Growpoint} from './growpoint';
import {Slowpoint} from './slowpoint';
import {displayCountdownMessage} from '../../utils/content';
import {socket} from '../../utils/websocket';

export class RaceCanvas {
  private static instance: RaceCanvas | null = null;
  private ctx: CanvasRenderingContext2D;
  public race: IRaceGame;
  public raf: number | null;
  private color = 'rgb(255, 255, 255)';

  private constructor(race: IRaceGame) {
    this.raf = null;
    this.race = race;
    this.ctx = race.ctx;
  }

  static getInstance(race?: IRaceGame): RaceCanvas {
    if (!RaceCanvas.instance) {
      if (!race)
        throw new Error('RaceGame is needed to initialize the Race Canvas');
      RaceCanvas.instance = new RaceCanvas(race);
    }
    return RaceCanvas.instance;
  }

  /**
   * Starts the game loop and initializes
   */
  public startGame(): void {
    this.race.timer.startCountdown();
    this.raf = window.requestAnimationFrame(this.gameLoop.bind(this));
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

    if (!this.race.gameStarted) return;

    this.race.timerDisplay.innerHTML = this.race.timer.formatTime(
      this.race.timer.getRemainingTime(),
    );

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
    if (
      this.race.isLocal &&
      this.race.timer.isRunning &&
      this.race.timer.isTimeUp()
    ) {
      this.endofAMatch(
        this.race.player.score > this.race.opponent.score
          ? this.race.player.id
          : this.race.opponent.id,
        undefined,
        undefined,
      );
      return;
    }

    // handle game logic
    if (!isCountdownActive) {
      if (this.race.isLocal) this.handlePointsSpawning();
      this.handleStuckCars();
      this.handlePointsCollision();
      this.handleCarMovement();
      this.updateScore();
      this.handleCarCollisions();
    }

    // Draw game elements
    this.race.track.draw();
    this.race.wall.draw();

    if (!isCountdownActive) {
      this.race.checkpoints.forEach(checkpoint => {
        checkpoint.draw();
      });
      this.race.currentGrowpoint?.draw();
      this.race.currentSlowpoint?.draw();
    }

    this.race.player.car?.draw();
    this.race.opponent.car?.draw();

    if (countdownMessage) {
      displayCountdownMessage(this.ctx, this.color, countdownMessage);
    }

    this.raf = requestAnimationFrame(this.gameLoop.bind(this));
  }

  /**
   * Handles car movement based on user input
   * Moves player.car with W/S keys and opponent.car with ArrowUp/ArrowDown keys
   * Also handles left/right movement for both cars
   */
  private handleCarMovement(): void {
    if (!this.race.gameStarted) return;
    let moved = false;

    if (this.race.isLocal) {
      // Local game - control opponent car with arrow keys
      this.race.opponent.car?.move(
        this.race.keys.ArrowUp ? true : this.race.keys.ArrowDown ? false : null,
        (this.race.keys.ArrowRight ? 1 : 0) -
          (this.race.keys.ArrowLeft ? 1 : 0),
        this.race.wall,
      );
    }

    // Track player car movement for sending to opponent
    const oldPlayerPosition = {
      x: this.race.player.car?.x || 0,
      y: this.race.player.car?.y || 0,
      angle: this.race.player.car?.angle || 0,
      speed: this.race.player.car?.speed || 0,
    };

    if (this.race.player.side == 'right') {
      this.race.player.car?.move(
        this.race.keys.ArrowUp ? true : this.race.keys.ArrowDown ? false : null,
        (this.race.keys.ArrowRight ? 1 : 0) -
          (this.race.keys.ArrowLeft ? 1 : 0),
        this.race.wall,
      );
    }

    if (this.race.player.side == 'left') {
      this.race.player.car?.move(
        this.race.keys.w ? true : this.race.keys.s ? false : null,
        (this.race.keys.d ? 1 : 0) - (this.race.keys.a ? 1 : 0),
        this.race.wall,
      );
    }

    // Check if player car actually moved
    if (
      oldPlayerPosition.x !== this.race.player.car?.x ||
      oldPlayerPosition.y !== this.race.player.car?.y ||
      oldPlayerPosition.angle !== this.race.player.car?.angle ||
      oldPlayerPosition.speed !== this.race.player.car?.speed
    ) {
      moved = true;
    }

    if (moved && !this.race.isLocal) {
      socket.send(
        JSON.stringify({
          type: 'carMove',
          playerId: this.race.player.id,
          timestamp: Date.now(),
          position: {
            x: this.race.player.car?.x || 0,
            y: this.race.player.car?.y || 0,
          },
          angle: this.race.player.car?.angle || 0,
          speed: this.race.player.car?.speed || 0,
        }),
      );
    }
  }

  /**
   * Updates the score display
   */
  private updateScore(): void {
    this.race.player.scoreElement.innerText = this.race.player.score.toString();
    this.race.opponent.scoreElement.innerText =
      this.race.opponent.score.toString();
    if (this.race.timerDisplay) {
      this.race.timerDisplay.innerText = `${this.race.timer.getRemainingTimeFormatted()}`;
    }
  }

  /**
   * Handles the spawning and management of checkpoints, growpoints, and slowpoints.
   * this funciton is only called if the game is local as the server handles it in a remote game
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
        this.race.wall,
        this.race.checkpoints, // Pass existing checkpoints to avoid overlap
      );
      this.race.checkpoints.push(newCheckpoint);
      this.race.lastCheckpointTime = currentTime;
    }

    // Handle growpoint spawning every 30 seconds
    if (
      this.race.lastGrowpointTime &&
      currentTime - this.race.lastGrowpointTime > 25000
    ) {
      this.race.currentGrowpoint = Growpoint.createRandomGrowpoint(
        this.ctx,
        this.race.wall,
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
        this.race.wall,
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
    //checkpoint collision -> increment score & remove it from the canvas
    if (this.race.checkpoints) {
      this.race.checkpoints = this.race.checkpoints?.filter(checkpoint => {
        if (checkpoint.isColliding(this.race.player.car)) {
          this.race.player.score += 2;
          this.updateScore();
          if (!this.race.isLocal) {
            socket.send(
              JSON.stringify({
                type: 'score',
                scorerID: this.race.player.id,
              }),
            );
          }
          return false; // Remove checkpoint
        }

        if (checkpoint.isColliding(this.race.opponent.car)) {
          this.race.opponent.score += 2;
          this.updateScore();
          if (!this.race.isLocal) {
            socket.send(
              JSON.stringify({
                type: 'score',
                scorerID: this.race.opponent.id,
              }),
            );
          }
          return false; // Remove checkpoint
        }

        return true; // Keep checkpoint
      });
    }

    //growpoint collision -> increases car size
    if (
      this.race.currentGrowpoint &&
      this.race.currentGrowpoint.isColliding(this.race.player.car) &&
      !this.race.player.car?.isBigger
    ) {
      this.race.currentGrowpoint = null;
      this.race.player.car?.applyCarGrowth();
      if (!this.race.isLocal) {
        socket.send(
          JSON.stringify({
            type: 'carGrowth',
            growthID: this.race.player.id,
          }),
        );
      }
    }

    //slowpoint collision -> slows down opposant's car
    if (
      this.race.currentSlowpoint &&
      this.race.currentSlowpoint.isColliding(this.race.player.car) &&
      !this.race.opponent.car?.isSlowed
    ) {
      this.race.currentSlowpoint = null;
      this.race.opponent.car?.applySlowdown();
      if (!this.race.isLocal) {
        socket.send(
          JSON.stringify({
            type: 'carSlowdown',
            slowID: this.race.opponent.id,
          }),
        );
      }
    }

    if (this.race.isLocal) {
      if (
        this.race.currentSlowpoint &&
        this.race.currentSlowpoint.isColliding(this.race.opponent.car) &&
        !this.race.player.car?.isSlowed
      ) {
        this.race.currentSlowpoint = null; // Clear slowpoint after collision
        this.race.player.car?.applySlowdown();
        // this.race.lastSlowpointTime = Date.now();
      }
      if (
        this.race.currentGrowpoint &&
        this.race.currentGrowpoint.isColliding(this.race.opponent.car) &&
        !this.race.opponent.car?.isBigger
      ) {
        this.race.currentGrowpoint = null; // Clear slowpoint after collision
        this.race.opponent.car?.applyCarGrowth();
        // this.race.lastGrowpointTime = Date.now() - 45000;
      }
    }
  }

  /**
   * Handles collisions between cars.
   * If cars collide, it checks which car is bigger and stops the smaller car.
   * It also creates a pop effect for visual feedback.
   */
  public handleCarCollisions(): void {
    if (!this.race.player.car || !this.race.opponent.car) return;
    const isColliding = this.race.player.car?.isCollidingWithCar(
      this.race.opponent.car,
    );

    if (isColliding) {
      if (this.race.player.car?.carWidth > this.race.opponent.car?.carWidth) {
        this.race.player.car?.handleCarCollision(this.race.opponent.car);
        this.race.opponent.car?.stopFor();
        socket.send(
          JSON.stringify({
            type: 'carstopped',
            stoppedID: this.race.opponent.id,
          }),
        );
      } else if (
        this.race.opponent.car?.carWidth > this.race.player.car?.carWidth
      ) {
        this.race.opponent.car?.handleCarCollision(this.race.player.car);
        this.race.player.car?.stopFor();
        socket.send(
          JSON.stringify({
            type: 'carstopped',
            stoppedID: this.race.opponent.id,
          }),
        );
      } else this.race.opponent.car?.handleCarCollision(this.race.player.car);
    }
  }

  /**
   * Handles the case where cars are stuck in walls.
   * Checks if each car is colliding with walls and resets their position if they are stuck.
   */
  private handleStuckCars(): void {
    if (!this.race.player.car || !this.race.opponent.car) return;
    const playerCarPosition = {
      x: this.race.player.car.x - this.race.player.car.carWidth / 2,
      y: this.race.player.car.y - this.race.player.car.carHeight / 2,
      width: this.race.player.car?.carWidth,
      height: this.race.player.car?.carHeight,
    };
    this.race.wall.isCarColliding(playerCarPosition);

    if (this.race.isLocal) {
      const opponentCarPosition = {
        x: this.race.opponent.car.x - this.race.opponent.car.carWidth / 2,
        y: this.race.opponent.car.y - this.race.opponent.car.carHeight / 2,
        width: this.race.opponent.car?.carWidth,
        height: this.race.opponent.car?.carHeight,
      };
      this.race.wall.isCarColliding(opponentCarPosition);
    }
  }

  public endofAMatch(winner: number, result?: string, eloChange?: number) {
    const gameUIElement = document.querySelector(
      '.race-game-ui',
    ) as GameUIElement;
    if (gameUIElement && gameUIElement.showGameEndModal) {
      gameUIElement.showGameEndModal({winner, result, eloChange});
    }
    this.resetCarGame();
  }

  public static destroyInstance(): void {
    if (RaceCanvas.instance) {
      // Cancel any running animation frame
      if (RaceCanvas.instance.raf) {
        window.cancelAnimationFrame(RaceCanvas.instance.raf);
      }
      RaceCanvas.instance = null;
    }
  }

  /**
   * Ends the game by stopping the timer and setting gameStarted to false.
   * This method is called when the time is up.
   */
  public resetCarGame(): void {
    this.race.timer.stop();
    this.race.player.score = 0;
    if (this.race.isLocal) this.race.opponent.score = 0;
    this.updateScore();
    this.race.timer.reset();
    this.race.gameStarted = false;
  }
}
