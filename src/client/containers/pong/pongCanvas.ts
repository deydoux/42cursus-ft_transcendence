import {GameUIElement, IPongGame} from '../../types/game';
import {Socket} from '../../services/websocket';
import {Store} from '../../services/store';
import {displayCountdownMessage} from '../../utils/content';

type aMap = Map<string, PongCanvas>;
export class PongCanvas {
  private static instances: aMap = new Map<string, PongCanvas>();
  private animationId: number | null = null;
  private gameRunning: boolean;
  private ctx: CanvasRenderingContext2D;
  public pong: IPongGame;
  private touchStartHandler: ((e: TouchEvent) => void) | null = null;
  private touchMoveHandler: ((e: TouchEvent) => void) | null = null;
  private touchEndHandler: ((e: TouchEvent) => void) | null = null;
  private websocket: Socket;
  private gameId: string | null = null;
  private lastPaddleState: 'idle' | 'up' | 'down' = 'idle';
  private opponentPaddleState: 'idle' | 'up' | 'down' = 'idle';

  private constructor(pong: IPongGame, gameId?: string) {
    this.websocket = Socket.getInstance();
    this.ctx = pong.ctx;
    this.pong = pong;
    this.gameRunning = false;
    this.gameId = gameId || null;
    this.setupTouchControls();
  }

  private setupTouchControls(): void {
    const canvas = this.ctx.canvas;

    // Create bound methods to store references
    this.touchStartHandler = this.handleTouchStart.bind(this);
    this.touchMoveHandler = this.handleTouchMove.bind(this);
    this.touchEndHandler = this.handleTouchEnd.bind(this);

    canvas.addEventListener('touchstart', this.touchStartHandler, {
      passive: false,
    });
    canvas.addEventListener('touchmove', this.touchMoveHandler, {
      passive: false,
    });
    canvas.addEventListener('touchend', this.touchEndHandler, {passive: false});
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

    // Remove touch listeners
    const canvas = this.ctx.canvas;
    if (this.touchStartHandler) {
      canvas.removeEventListener('touchstart', this.touchStartHandler);
    }
    if (this.touchMoveHandler) {
      canvas.removeEventListener('touchmove', this.touchMoveHandler);
    }
    if (this.touchEndHandler) {
      canvas.removeEventListener('touchend', this.touchEndHandler);
    }
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

    this.drawTouchZones();

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

  private handleTouchStart(e: TouchEvent): void {
    e.preventDefault();

    const canvas = this.ctx.canvas;
    const rect = canvas.getBoundingClientRect();

    // Scale factor between displayed size and canvas size
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    // Define zone size (must match drawTouchZones)
    const zoneWidth = canvas.width * 0.25;
    const zoneHeight = canvas.height * 0.25;

    // Handle multiple touches for local multiplayer
    Array.from(e.touches).forEach(touch => {
      // Get touch position relative to canvas display
      const touchXDisplay = touch.clientX - rect.left;
      const touchYDisplay = touch.clientY - rect.top;

      // Scale to canvas coordinates
      const touchX = touchXDisplay * scaleX;
      const touchY = touchYDisplay * scaleY;

      console.log(
        `Touch at: X=${touchX.toFixed(0)}, Y=${touchY.toFixed(0)}, Canvas: ${canvas.width}x${canvas.height}`,
      );

      // Determine which corner was touched
      const isTopLeft = touchX < zoneWidth && touchY < zoneHeight;
      const isBottomLeft =
        touchX < zoneWidth && touchY > canvas.height - zoneHeight;
      const isTopRight =
        touchX > canvas.width - zoneWidth && touchY < zoneHeight;
      const isBottomRight =
        touchX > canvas.width - zoneWidth &&
        touchY > canvas.height - zoneHeight;

      console.log(
        `Corners: TL=${isTopLeft}, BL=${isBottomLeft}, TR=${isTopRight}, BR=${isBottomRight}`,
      );

      if (this.pong.isLocal) {
        // Reset all keys first
        this.pong.keys.w = false;
        this.pong.keys.s = false;
        this.pong.keys.ArrowUp = false;
        this.pong.keys.ArrowDown = false;

        // Local mode: corners control respective paddles
        if (isTopLeft) {
          this.pong.keys.w = true;
          console.log('LEFT PADDLE UP');
        } else if (isBottomLeft) {
          this.pong.keys.s = true;
          console.log('LEFT PADDLE DOWN');
        } else if (isTopRight) {
          this.pong.keys.ArrowUp = true;
          console.log('RIGHT PADDLE UP');
        } else if (isBottomRight) {
          this.pong.keys.ArrowDown = true;
          console.log('RIGHT PADDLE DOWN');
        }
      } else {
        // Online mode: corners based on player side
        if (this.pong.player.side === 'left') {
          // Reset keys
          this.pong.keys.w = false;
          this.pong.keys.s = false;

          if (isTopLeft) {
            this.pong.keys.w = true;
          } else if (isBottomLeft) {
            this.pong.keys.s = true;
          }
        } else {
          // Reset keys
          this.pong.keys.ArrowUp = false;
          this.pong.keys.ArrowDown = false;

          if (isTopRight) {
            this.pong.keys.ArrowUp = true;
          } else if (isBottomRight) {
            this.pong.keys.ArrowDown = true;
          }
        }
      }
    });
  }

  private handleTouchMove(e: TouchEvent): void {
    e.preventDefault();
    this.handleTouchStart(e); // Reuse logic
  }

  private handleTouchEnd(e: TouchEvent): void {
    e.preventDefault();

    // Reset all keys if no more touches
    if (e.touches.length === 0) {
      this.pong.keys.w = false;
      this.pong.keys.s = false;
      this.pong.keys.ArrowUp = false;
      this.pong.keys.ArrowDown = false;
    } else {
      // Re-evaluate remaining touches
      this.handleTouchStart(e);
    }
  }

  private drawTouchZones(): void {
    const canvas = this.ctx.canvas;
    const ctx = this.ctx;

    // Save current state
    ctx.save();

    // Set styling
    ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 2;

    // Define zone size (25% of canvas dimensions)
    const zoneWidth = canvas.width * 0.25;
    const zoneHeight = canvas.height * 0.25;

    if (this.pong.isLocal) {
      // Local mode: 4 corners split left/right

      // TOP LEFT (left paddle up)
      ctx.fillRect(0, 0, zoneWidth, zoneHeight);
      ctx.strokeRect(0, 0, zoneWidth, zoneHeight);

      // BOTTOM LEFT (left paddle down)
      ctx.fillRect(0, canvas.height - zoneHeight, zoneWidth, zoneHeight);
      ctx.strokeRect(0, canvas.height - zoneHeight, zoneWidth, zoneHeight);

      // TOP RIGHT (right paddle up)
      ctx.fillRect(canvas.width - zoneWidth, 0, zoneWidth, zoneHeight);
      ctx.strokeRect(canvas.width - zoneWidth, 0, zoneWidth, zoneHeight);

      // BOTTOM RIGHT (right paddle down)
      ctx.fillRect(
        canvas.width - zoneWidth,
        canvas.height - zoneHeight,
        zoneWidth,
        zoneHeight,
      );
      ctx.strokeRect(
        canvas.width - zoneWidth,
        canvas.height - zoneHeight,
        zoneWidth,
        zoneHeight,
      );

      // Draw arrows/icons
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Left paddle arrows
      ctx.fillText('↑', zoneWidth / 2, zoneHeight / 2);
      ctx.fillText('↓', zoneWidth / 2, canvas.height - zoneHeight / 2);

      // Right paddle arrows
      ctx.fillText('↑', canvas.width - zoneWidth / 2, zoneHeight / 2);
      ctx.fillText(
        '↓',
        canvas.width - zoneWidth / 2,
        canvas.height - zoneHeight / 2,
      );
    } else {
      // Online mode: corners based on player side
      if (this.pong.player.side === 'left') {
        // TOP LEFT (move up)
        ctx.fillRect(0, 0, zoneWidth, zoneHeight);
        ctx.strokeRect(0, 0, zoneWidth, zoneHeight);

        // BOTTOM LEFT (move down)
        ctx.fillRect(0, canvas.height - zoneHeight, zoneWidth, zoneHeight);
        ctx.strokeRect(0, canvas.height - zoneHeight, zoneWidth, zoneHeight);

        // Draw arrows
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '28px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('↑', zoneWidth / 2, zoneHeight / 2);
        ctx.fillText('↓', zoneWidth / 2, canvas.height - zoneHeight / 2);
      } else {
        // TOP RIGHT (move up)
        ctx.fillRect(canvas.width - zoneWidth, 0, zoneWidth, zoneHeight);
        ctx.strokeRect(canvas.width - zoneWidth, 0, zoneWidth, zoneHeight);

        // BOTTOM RIGHT (move down)
        ctx.fillRect(
          canvas.width - zoneWidth,
          canvas.height - zoneHeight,
          zoneWidth,
          zoneHeight,
        );
        ctx.strokeRect(
          canvas.width - zoneWidth,
          canvas.height - zoneHeight,
          zoneWidth,
          zoneHeight,
        );

        // Draw arrows
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.font = '28px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('↑', canvas.width - zoneWidth / 2, zoneHeight / 2);
        ctx.fillText(
          '↓',
          canvas.width - zoneWidth / 2,
          canvas.height - zoneHeight / 2,
        );
      }
    }

    // Restore state
    ctx.restore();
  }

  public handlePaddleMovement() {
    if (this.pong.isScoring) return;
    const paddleSpeed = this.ctx.canvas.height * 0.01;

    let currentState: 'idle' | 'up' | 'down' = 'idle';
    let direction = 0;

    if (this.pong.keys.w || (!this.pong.isLocal && this.pong.keys.ArrowUp)) {
      this.pong.player.paddle?.move(-paddleSpeed);
      direction = -1;
      currentState = 'up';
    } else if (
      this.pong.keys.s ||
      (!this.pong.isLocal && this.pong.keys.ArrowDown)
    ) {
      this.pong.player.paddle?.move(paddleSpeed);
      direction = 1;
      currentState = 'down';
    }

    if (this.pong.isLocal) {
      if (this.pong.keys.ArrowUp) {
        this.pong.opponent.paddle?.move(-paddleSpeed);
      } else if (this.pong.keys.ArrowDown) {
        this.pong.opponent.paddle?.move(paddleSpeed);
      }
    } else {
      // Online mode: use opponent's state
      if (this.opponentPaddleState === 'up') {
        this.pong.opponent.paddle?.move(-paddleSpeed);
      } else if (this.opponentPaddleState === 'down') {
        this.pong.opponent.paddle?.move(paddleSpeed);
      }
    }

    if (!this.pong.isLocal && currentState !== this.lastPaddleState)
      this.websocket.send({
        type: 'paddleMove',
        side: this.pong.player.side,
        direction,
        yPosition: this.pong.player.paddle?.y || 0,
        timestamp: Date.now(),
      });
    this.lastPaddleState = currentState;
  }

  public setOpponentPaddleMovement(direction: number): void {
    if (direction === -1) {
      this.opponentPaddleState = 'up';
    } else if (direction === 1) {
      this.opponentPaddleState = 'down';
    } else {
      this.opponentPaddleState = 'idle';
    }
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
