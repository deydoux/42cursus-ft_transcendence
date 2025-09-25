import {IPongGame} from '../types/game';
import {asciiArt} from '../utils/content';
import {displayCountdownMessage} from '../utils/content';
import {socket} from '../utils/websocket';

export class PongCanvas {
  private static instance: PongCanvas | null = null;
  private ctx: CanvasRenderingContext2D;
  private pong: IPongGame;
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

    if (!this.pong.gameStarted) {
      this.displayStartMessage();
      return;
    }
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
      this.drawGameOverScreen();
      this.resetPongGame();
      return;
    }

    if (countdownMessage) {
      console.log(countdownMessage);
      displayCountdownMessage(this.ctx, this.color, countdownMessage);
    }
    this.raf = window.requestAnimationFrame(this.gameLoop.bind(this));
  }

  /**
   * Updates the score display
   */
  private updateScore(): void {
    this.pong.player.scoreElement.innerText = this.pong.player.score.toString();
    this.pong.opponent.scoreElement.innerText =
      this.pong.opponent.score.toString();
  }
  public displayStartMessage() {
    this.updateScore();

    this.ctx.save();

    const width = this.ctx.canvas.width;
    const height = this.ctx.canvas.height;
    const baseFontSize = Math.max(width, height) * 0.025;
    const smallFontSize = baseFontSize * 0.5;
    const lineHeight = smallFontSize * 1.25;

    // Calculate total height of the block (title + ascii art)
    const titleHeight = baseFontSize;
    const asciiArtHeight = asciiArt.length * lineHeight;
    const totalBlockHeight = titleHeight + asciiArtHeight + lineHeight; // extra lineHeight for spacing

    // Center of ctx.canvas
    const centerX = width / 2;
    const centerY = height / 2;

    // Start drawing so that the block is vertically centered
    let currentY = centerY - totalBlockHeight / 2 + titleHeight / 2;

    this.ctx.font = `bold ${baseFontSize}px monospace`;
    this.ctx.fillStyle = this.color;
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.shadowBlur = 15;
    this.ctx.shadowColor = 'rgba(227, 11, 92, 0.781)';
    this.ctx.fillText('Press SPACE to start the game!', centerX, currentY);

    // Draw ASCII art below the title
    this.ctx.font = `${smallFontSize}px monospace`;
    currentY += titleHeight / 2 + lineHeight / 2; // space between title and art
    for (let i = 0; i < asciiArt.length; i++) {
      this.ctx.fillText(asciiArt[i], centerX, currentY + i * lineHeight);
    }

    this.ctx.restore();
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
    }
    if (this.pong.player.side == 'left') {
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
    if (moved && this.pong.isLocal)
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
    // Apply opponent's movement to their paddle
    const opponentPlayer =
      this.pong.player.side === 'left' ? this.pong.opponent : this.pong.player;

    if (data.side !== this.pong.player.side && opponentPlayer.paddle) {
      // Use the exact position for better sync
      opponentPlayer.paddle.y = data.yPosition;

      // Optional: Add interpolation for smoother movement
      opponentPlayer.paddle.move(
        data.direction * (this.ctx.canvas.height * 0.01),
      );
    }
  }
  private drawGameOverScreen(): void {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    const centerX = this.ctx.canvas.width / 2;
    const centerY = this.ctx.canvas.height / 2;

    // Determine winner
    const winner =
      this.pong.player.score === 10
        ? this.pong.player.username
        : this.pong.opponent.username;
    const loser =
      this.pong.opponent.score === 10
        ? this.pong.opponent.username
        : this.pong.player.username;
    const winnerScore =
      this.pong.leftPlayerScore === 10
        ? this.pong.leftPlayerScore
        : this.pong.rightPlayerScore;
    const loserScore =
      this.pong.leftPlayerScore === 10
        ? this.pong.rightPlayerScore
        : this.pong.leftPlayerScore;

    // Catch phrase at the top
    this.ctx.fillStyle = '#FFD700'; // Gold color
    this.ctx.font = 'bold 96px sans-serif';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('🏓 GAME OVER! 🏓', centerX, centerY - 400);

    // Secondary text
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = 'bold 48px sans-serif';
    this.ctx.fillText(`${winner} is Victorious!`, centerX, centerY - 320);

    // Draw podium with dynamic heights
    this.drawPodium(centerX, centerY, winnerScore, loserScore);

    this.drawCrown(winner, centerX - 160, centerY - 60, true);
    this.drawCrown(loser, centerX + 160, centerY + 20, false);

    // Draw position numbers
    this.drawPositionNumbers(centerX, centerY);

    // Draw scores
    this.drawScores(winner, loser, winnerScore, loserScore, centerX, centerY);

    // Draw restart instruction
    this.ctx.fillStyle = '#CCCCCC';
    this.ctx.font = '40px sans-serif';
    this.ctx.fillText('Press SPACE to Play Again!', centerX, centerY + 400);
  }

  private drawPodium(
    centerX: number,
    centerY: number,
    winnerScore: number,
    loserScore: number,
  ): void {
    // Podium colors
    const goldColor = '#FFD700';
    const silverColor = '#C0C0C0';

    this.ctx.save();

    // Calculate dynamic heights based on scores
    const baseHeight = 80;
    const maxHeight = 160;
    const scoreDiff = Math.abs(winnerScore - loserScore);
    const heightDiff = Math.min(maxHeight - baseHeight, scoreDiff * 20);

    // Winner podium (left side)
    this.ctx.fillStyle = goldColor;
    const winnerHeight = baseHeight + heightDiff;
    const winnerY = centerY + 120 - winnerHeight;
    this.ctx.fillRect(centerX - 240, winnerY, 160, winnerHeight);
    this.ctx.strokeStyle = '#B8860B';
    this.ctx.lineWidth = 6;
    this.ctx.strokeRect(centerX - 240, winnerY, 160, winnerHeight);

    // Loser podium (right side)
    this.ctx.fillStyle = silverColor;
    const loserHeight = baseHeight;
    const loserY = centerY + 120 - loserHeight;
    this.ctx.fillRect(centerX + 80, loserY, 160, loserHeight);
    this.ctx.strokeStyle = '#A0A0A0';
    this.ctx.lineWidth = 6;
    this.ctx.strokeRect(centerX + 80, loserY, 160, loserHeight);

    this.ctx.restore();
  }

  private drawCrown(
    player: string | null,
    x: number,
    y: number,
    isWinner: boolean,
  ): void {
    this.ctx.save();
    this.ctx.translate(x, y);

    // Winner crown/effect
    if (isWinner) {
      this.ctx.fillStyle = '#FFD700';
      this.ctx.font = 'bold 60px sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('👑', 0, -60);
    }

    this.ctx.restore();
  }

  private drawPositionNumbers(centerX: number, centerY: number): void {
    this.ctx.save();
    this.ctx.font = 'bold 72px sans-serif';
    this.ctx.textAlign = 'center';

    // 1st place
    this.ctx.fillStyle = '#FFD700';
    this.ctx.strokeStyle = '#B8860B';
    this.ctx.lineWidth = 4;
    this.ctx.fillText('1', centerX - 160, centerY + 100);
    this.ctx.strokeText('1', centerX - 160, centerY + 100);

    // 2nd place
    this.ctx.fillStyle = '#C0C0C0';
    this.ctx.strokeStyle = '#C0C0C0';
    this.ctx.lineWidth = 4;
    this.ctx.fillText('2', centerX + 160, centerY + 110);
    this.ctx.strokeText('2', centerX + 160, centerY + 110);

    this.ctx.restore();
  }

  private drawScores(
    winner: string | null,
    loser: string | null,
    winnerScore: number,
    loserScore: number,
    centerX: number,
    centerY: number,
  ): void {
    this.ctx.save();
    this.ctx.font = 'bold 36px sans-serif';
    this.ctx.textAlign = 'center';

    // Winner score
    this.ctx.fillStyle = '#FFD700';
    this.ctx.fillText(`${winner || 'Player 1'}`, centerX - 160, centerY + 170);
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillText(`Score: ${winnerScore}`, centerX - 160, centerY + 210);

    // Loser score
    this.ctx.fillStyle = '#C0C0C0';
    this.ctx.fillText(`${loser || 'Player 2'}`, centerX + 160, centerY + 180);
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.fillText(`Score: ${loserScore}`, centerX + 160, centerY + 220);

    // Score difference
    const scoreDiff = Math.abs(winnerScore - loserScore);
    this.ctx.fillStyle = '#FFFF00';
    this.ctx.font = '32px sans-serif';
    this.ctx.fillText(
      `Victory Margin: ${scoreDiff} points`,
      centerX,
      centerY + 280,
    );

    this.ctx.restore();
  }

  private resetPongGame() {
    this.pong.leftPlayerScore = 0;
    this.pong.rightPlayerScore = 0;
    this.updateScore();

    // Reset ball position and velocity
    this.pong.ball.x = this.pong.ctx.canvas.width / 2;
    this.pong.ball.y = this.pong.ctx.canvas.height / 2;
    this.pong.ball.vx = this.pong.ctx.canvas.height * 0.006;
    this.pong.ball.vy = this.pong.ctx.canvas.width * 0.004;

    // Reset paddles
    this.pong.leftPaddle.y = 0;
    this.pong.rightPaddle.y = 0;

    this.pong.gameStarted = false;
  }
}
