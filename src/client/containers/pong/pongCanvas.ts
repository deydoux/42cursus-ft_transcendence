import {IPlayer, IPongGame} from '../../types/game';
import {displayCountdownMessage} from '../../utils/content';
import {socket} from '../../utils/websocket';

export class PongCanvas {
  private static instance: PongCanvas | null = null;
  private ctx: CanvasRenderingContext2D;
  public pong: IPongGame;
  private raf: number | null;
  private color = 'rgb(0, 0, 0)';

  private constructor(pong: IPongGame) {
    this.ctx = pong.ctx;
    this.pong = pong;
    this.raf = null;
  }

  static getInstance(pong?: IPongGame): PongCanvas {
    if (!PongCanvas.instance) {
      if (!pong)
        throw new Error('PongGame is needed to initialize the Pong Canvas');
      PongCanvas.instance = new PongCanvas(pong);
    }
    return PongCanvas.instance;
  }

  public startGame() {
    this.pong.timer.startCountdown();
    this.raf = window.requestAnimationFrame(this.gameLoop.bind(this));
  }

  public gameLoop() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    if (!this.pong.gameStarted) return;
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

    if (this.pong.player.score === 5 || this.pong.opponent.score === 5) {
      if (this.raf) {
        window.cancelAnimationFrame(this.raf);
        this.pong.gameStarted = false;
      }
      this.resetPongGame();
      return;
    }

    if (countdownMessage)
      displayCountdownMessage(this.ctx, this.color, countdownMessage);
    this.raf = window.requestAnimationFrame(this.gameLoop.bind(this));
  }

  private updateScore(): void {
    this.pong.player.scoreElement.innerHTML = this.pong.player.score.toString();
    this.pong.opponent.scoreElement.innerHTML =
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
      this.sendPaddleMovement(
        this.pong.player.side,
        direction,
        this.pong.player.paddle?.y || 0,
      );
  }

  private sendPaddleMovement(
    side: string,
    direction: number,
    yPosition: number,
  ) {
    socket.send(
      JSON.stringify({
        type: 'move',
        side,
        direction,
        yPosition,
        timestamp: Date.now(),
      }),
    );
  }

  public handleOpponentPaddleMovement(data: {
    side: string;
    direction: number;
    yPosition: number;
    timestamp: number;
  }) {
    // Find the player whose side matches the incoming data
    let targetPlayer: IPlayer | null = null;

    if (this.pong.player.side === data.side) {
      // This shouldn't happen - we received our own movement
      return;
    } else if (this.pong.opponent.side === data.side) {
      // The opponent is moving
      targetPlayer = this.pong.opponent;
    }

    if (targetPlayer && targetPlayer.paddle) {
      // Use the exact position for better sync
      targetPlayer.paddle.y = data.yPosition;
      // Optional: Add interpolation for smoother movement
      // targetPlayer.paddle.move(data.direction * (this.ctx.canvas.height * 0.01));
    }
  }

  public resetPongGame() {
    this.pong.player.score = 0;
    this.pong.opponent.score = 0;
    this.updateScore();

    // Reset ball position and velocity
    this.pong.ball.x = this.pong.ctx.canvas.width / 2;
    this.pong.ball.y = this.pong.ctx.canvas.height / 2;
    this.pong.ball.vx = this.pong.ctx.canvas.height * 0.006;
    this.pong.ball.vy = this.pong.ctx.canvas.width * 0.004;

    // Reset paddles
    if (this.pong.player.paddle && this.pong.opponent.paddle) {
      this.pong.player.paddle.y = 0;
      this.pong.opponent.paddle.y = 0;
    }
    this.pong.gameStarted = false;
  }
}
