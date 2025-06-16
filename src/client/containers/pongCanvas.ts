import {PongGame} from '../utils/content';
import {asciiArt} from '../utils/content';
import {resetPongGame} from '../utils/content';

export class PongCanvas {
  private ctx: CanvasRenderingContext2D;
  private pong: PongGame;
  private raf: number | null;
  private dpr: number;
  private color = '#fde';

  private bandrollActive = false;
  private bandrollX = 0;
  private bandrollText = '';
  private bandrollSpeed = 6;

  constructor(pong: PongGame) {
    this.ctx = pong.ctx;
    this.pong = pong;
    this.raf = null;
    this.dpr = window.devicePixelRatio || 1;
  }

  public startGame() {
    if (this.pong.gameStarted) return;
    this.pong.gameStarted = true;
    this.raf = window.requestAnimationFrame(this.gameLoop.bind(this));
  }

  public gameLoop() {
    this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);

    if (!this.pong.gameStarted) {
      this.displayStartMessage();
      return;
    }

    this.handlePaddleMovement();
    this.pong.ball.draw();
    this.pong.leftPaddle.draw();
    this.pong.rightPaddle.draw();
    this.pong.ball.update(this.pong);

    if (this.pong.leftPlayerScore === 5 || this.pong.rightPlayerScore === 5) {
      const winner =
        this.pong.leftPlayerScore === 5
          ? this.pong.leftPlayer
          : this.pong.rightPlayer;
      const winnerName = winner ?? 'Player'; // Ensure winner is a string
      this.pong.announcement.innerText =
        "And that's a win for " + winnerName + '!';
      if (this.raf) {
        window.cancelAnimationFrame(this.raf);
        this.pong.gameStarted = false;
      }

      this.startBandroll(winnerName, () => {
        this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        resetPongGame(this.pong);
        this.displayStartMessage();
      });

      return;
    }

    this.raf = window.requestAnimationFrame(this.gameLoop.bind(this));
  }

  public displayStartMessage() {
    this.pong.announcement.innerText = `Good luck ${this.pong.leftPlayer} and ${this.pong.rightPlayer}!`;

    this.ctx.save();

    const width = this.ctx.canvas.width;
    const height = this.ctx.canvas.height;
    const baseFontSize = Math.max(width, height) * 0.025 * this.dpr;
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
    this.ctx.fillText('Press SPACE to start/play again!', centerX, currentY);

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
    if (this.pong.keys.w) this.pong.leftPaddle.move(-paddleSpeed);
    if (this.pong.keys.s) this.pong.leftPaddle.move(paddleSpeed);
    if (this.pong.keys.ArrowUp) this.pong.rightPaddle.move(-paddleSpeed);
    if (this.pong.keys.ArrowDown) this.pong.rightPaddle.move(paddleSpeed);
  }

  private startBandroll(winner: string, callback: () => void) {
    this.bandrollText = `✨ ${winner} wins! Issok tho 'cause ur ass is fatter ✨`;
    this.bandrollX = this.ctx.canvas.width;
    this.bandrollActive = true;

    const animate = () => {
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
      this.ctx.font = `bold ${Math.floor(this.ctx.canvas.height * 0.08)}px monospace`;
      this.ctx.fillStyle = this.color;
      this.ctx.textAlign = 'left';
      this.ctx.textBaseline = 'middle';
      this.ctx.shadowBlur = 15;
      this.ctx.shadowColor = 'rgba(227, 11, 92, 0.781)';
      this.ctx.fillText(
        this.bandrollText,
        this.bandrollX,
        this.ctx.canvas.height / 2,
      );

      this.bandrollX -= this.bandrollSpeed;

      if (this.bandrollX + this.ctx.measureText(this.bandrollText).width > 0) {
        requestAnimationFrame(animate);
      } else {
        this.bandrollActive = false;
        callback();
      }
    };

    animate();
  }
}
