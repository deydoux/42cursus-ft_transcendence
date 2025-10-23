import {GameUIElement, IPongGame} from '../../types/game';
import {Store} from '../../services/store';
import {displayCountdownMessage} from '../../utils/content';
import {socket} from '../../utils/websocket';

type aMap = Map<string, PongCanvas>;
export class PongCanvas {
  private static instances: aMap = new Map<string, PongCanvas>();
  private animationId: number | null = null;
  private gameRunning: boolean;
  private ctx: CanvasRenderingContext2D;
  public pong: IPongGame;
  private gameId: string | null = null;

  private constructor(pong: IPongGame, gameId?: string) {
    this.ctx = pong.ctx;
    this.pong = pong;
    this.gameRunning = false;
    this.gameId = gameId || null;
  }

  public static createInstance(
    pong: IPongGame,
    gameId = 'default',
  ): PongCanvas {
    // Clear previous instance with same gameId if it exists
    if (PongCanvas.instances.has(gameId)) {
      PongCanvas.instances.get(gameId)?.cleanup();
    }

    const instance = new PongCanvas(pong, gameId);
    PongCanvas.instances.set(gameId, instance);
    return instance;
  }

  public static getInstance(gameId: string): PongCanvas | null {
    return PongCanvas.instances.get(gameId) || null;
  }

  public static clearInstance(gameId = 'default'): void {
    const instance = PongCanvas.instances.get(gameId);
    if (instance) {
      instance.cleanup();
      PongCanvas.instances.delete(gameId);
    }
  }

  public static clearAllInstances(): void {
    PongCanvas.instances.forEach(instance => {
      instance.cleanup();
    });
    PongCanvas.instances.clear();
  }

  public cleanup(): void {
    // Stop animation loop
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }

    // Stop game
    this.gameRunning = false;

    // Clear canvas
    if (this.pong.ctx) {
      this.pong.ctx.clearRect(
        0,
        0,
        this.pong.ctx.canvas.width,
        this.pong.ctx.canvas.height,
      );
    }

    // Reset timer
    if (this.pong.timer) {
      this.pong.timer.stop();
    }

    console.log('PongCanvas cleaned up (gameId: ${this.gameId})');
  }

  public startGame(): void {
    this.gameRunning = true;
    this.pong.timer.startCountdown();
    this.gameLoop();
  }

  public stopGame(): void {
    this.gameRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  public gameLoop() {
    if (!this.gameRunning) return;
    if (!this.pong.gameStarted) return;

    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    // Check if countdown is active
    const isCountdownActive = this.pong.timer.isCountdownActive();
    const countdownMessage = this.pong.timer.getCountdownMessage();

    this.updateScore();
    this.pong.player.paddle?.draw();
    this.pong.opponent.paddle?.draw();
    if (!isCountdownActive) {
      this.handlePaddleMovement();
      this.pong.ball.draw();
      this.pong.ball.update(this.pong);
    }

    if (
      this.pong.isLocal &&
      (this.pong.player.score === 3 || this.pong.opponent.score === 3)
    )
      this.endofAMatch(
        this.pong.player.score == 3
          ? this.pong.player.id
          : this.pong.opponent.id,
        undefined,
        undefined,
        true,
      );

    if (countdownMessage)
      displayCountdownMessage(this.ctx, 'rgb(0, 0, 0)', countdownMessage);
    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  private updateScore(): void {
    this.pong.player.scoreElement.innerText = this.pong.player.score.toString();
    this.pong.opponent.scoreElement.innerText =
      this.pong.opponent.score.toString();
  }

  public handlePaddleMovement() {
    if (this.pong.isScoring) return;
    const paddleSpeed = this.ctx.canvas.height * 0.01;

    let moved = false;
    let direction = 0;

    if (this.pong.player.side == 'right') {
      if (this.pong.keys.ArrowUp) {
        this.pong.player.paddle?.move(-paddleSpeed);
        direction = -1;
        moved = true;
      }
      if (this.pong.keys.ArrowDown) {
        this.pong.player.paddle?.move(paddleSpeed);
        direction = 1;
        moved = true;
      }
    } else if (this.pong.player.side == 'left') {
      if (this.pong.keys.w) {
        this.pong.player.paddle?.move(-paddleSpeed);
        direction = -1;
        moved = true;
      }
      if (this.pong.keys.s) {
        this.pong.player.paddle?.move(paddleSpeed);
        direction = 1;
        moved = true;
      }
    }
    if (this.pong.isLocal) {
      if (this.pong.keys.ArrowUp) {
        this.pong.opponent.paddle?.move(-paddleSpeed);
        direction = -1;
        moved = true;
      }
      if (this.pong.keys.ArrowDown) {
        this.pong.opponent.paddle?.move(paddleSpeed);
        direction = 1;
        moved = true;
      }
    }

    if (moved && !this.pong.isLocal)
      socket.send(
        JSON.stringify({
          type: 'paddleMove',
          side: this.pong.player.side,
          direction,
          yPosition: this.pong.player.paddle?.y || 0,
          timestamp: Date.now(),
        }),
      );
  }

  public endofAMatch(
    winner: number,
    result?: string,
    eloChange?: number,
    isLocal?: boolean,
  ) {
    const {game} = Store.getInstance().getState();
    // Update final scores in DOM before showing modal
    const winnerSide = isLocal
      ? winner === this.pong.player.id
        ? 'left'
        : 'right'
      : winner === game.players[0].id
        ? 'left'
        : 'right';
    const winnerScoreElement = document.getElementById(`${winnerSide}_score`);
    if (winnerScoreElement) {
      winnerScoreElement.textContent = '3';
    }

    const gameUIElement = document.querySelector(
      '.pong-game-ui',
    ) as GameUIElement;
    if (gameUIElement && gameUIElement.showGameEndModal) {
      gameUIElement.showGameEndModal({winner, result, eloChange});
    }
    this.resetPongGame();
  }

  public resetPongGame() {
    this.pong.timer.reset();
    this.pong.player.score = 0;
    this.pong.opponent.score = 0;
    this.updateScore();

    // Reset ball position and velocity
    this.pong.ball.x = this.pong.ctx.canvas.width / 2;
    this.pong.ball.y = this.pong.ctx.canvas.height / 2;

    // Only set initial velocity for local games
    if (this.pong.isLocal) {
      this.pong.ball.vx = this.pong.ctx.canvas.height * 0.006;
      this.pong.ball.vy = this.pong.ctx.canvas.width * 0.004;
    } else {
      this.pong.ball.vx = 0;
      this.pong.ball.vy = 0;
    }

    // Reset paddles to center position
    if (this.pong.player.paddle && this.pong.opponent.paddle) {
      this.pong.player.paddle.y =
        (this.pong.ctx.canvas.height - this.pong.player.paddle.height) / 2;
      this.pong.opponent.paddle.y =
        (this.pong.ctx.canvas.height - this.pong.opponent.paddle.height) / 2;
    }
    this.pong.gameStarted = false;
    this.pong.isScoring = false;
  }
}
