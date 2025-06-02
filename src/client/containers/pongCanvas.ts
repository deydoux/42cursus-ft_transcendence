import {Keys} from '../utils/content';
import {PongGame} from '../utils/content';
import {asciiArt} from '../utils/content';
import {resetPongGame} from '../utils/content';

export class PongCanvas {
  private ctx: CanvasRenderingContext2D;
  private gameContainer: HTMLCanvasElement;
  private pong: PongGame;
  private raf: number | null;
  private dpr: number;

  private bandrollActive = false;
  private bandrollX = 0;
  private bandrollText = '';
  private bandrollSpeed = 6;

  constructor(gameContainer: HTMLCanvasElement, pong: PongGame) {
    this.gameContainer = gameContainer;
    this.ctx = pong.leftPaddle.ctx;
    this.pong = pong;
    this.raf = null;
    this.dpr = window.devicePixelRatio || 1;
  }

  public startGame(announcement: HTMLElement) {
    if (this.pong.gameStarted) return;
    this.pong.gameStarted = true;
    this.raf = window.requestAnimationFrame(() =>
      this.draw(announcement, this.pong.keys, this.pong),
    );
  }

  public draw(announcement: HTMLElement, keys: Keys, pong: PongGame) {
    this.ctx.clearRect(
      0,
      0,
      this.gameContainer.width,
      this.gameContainer.height,
    );

    if (!pong.gameStarted) {
      this.displayStartMessage(announcement);
      return;
    }

    this.handlePaddleMovement(keys);
    pong.ball.draw();
    pong.leftPaddle.draw();
    pong.rightPaddle.draw();
    pong.ball.update(pong);

    if (pong.leftPlayerScore === 5 || pong.rightPlayerScore === 5) {
      const winner =
        pong.leftPlayerScore === 5 ? pong.leftPlayer : pong.rightPlayer;
      const winnerName = winner ?? 'Player'; // Ensure winner is a string
      announcement.innerText = "And that's a win for " + winnerName + '!';
      if (this.raf) {
        window.cancelAnimationFrame(this.raf);
        pong.gameStarted = false;
      }

      this.ctx.clearRect(
        0,
        0,
        this.gameContainer.width,
        this.gameContainer.height,
      );
      resetPongGame(pong, this.gameContainer);
      this.displayStartMessage(announcement);

      this.startBandroll(winnerName, () => {
        announcement.innerText = `Good luck ${this.pong.leftPlayer} and ${this.pong.rightPlayer}!`;
      });

      return;
    }

    this.raf = window.requestAnimationFrame(() =>
      this.draw(announcement, keys, pong),
    );
  }

  public displayStartMessage(announcement: HTMLElement) {
    announcement.innerText = `Good luck ${this.pong.leftPlayer} and ${this.pong.rightPlayer}!`;

    this.ctx.save();

    const width = this.gameContainer.width;
    const height = this.gameContainer.height;
    const baseFontSize = Math.max(width, height) * 0.025 * this.dpr;
    const smallFontSize = baseFontSize * 0.5;
    const lineHeight = smallFontSize * 1.25;

    // Calculate total height of the block (title + ascii art)
    const titleHeight = baseFontSize;
    const asciiArtHeight = asciiArt.length * lineHeight;
    const totalBlockHeight = titleHeight + asciiArtHeight + lineHeight; // extra lineHeight for spacing

    // Center of canvas
    const centerX = width / 2;
    const centerY = height / 2;

    // Start drawing so that the block is vertically centered
    let currentY = centerY - totalBlockHeight / 2 + titleHeight / 2;

    this.ctx.font = `bold ${baseFontSize}px monospace`;
    this.ctx.fillStyle = 'white';
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'middle';
    this.ctx.fillText('Press SPACE to start/play again!', centerX, currentY);

    // Draw ASCII art below the title
    this.ctx.font = `${smallFontSize}px monospace`;
    currentY += titleHeight / 2 + lineHeight / 2; // space between title and art
    for (let i = 0; i < asciiArt.length; i++) {
      this.ctx.fillText(asciiArt[i], centerX, currentY + i * lineHeight);
    }

    this.ctx.restore();
  }

  public handlePaddleMovement(keys: Keys) {
    const paddleSpeed = this.gameContainer.height * 0.01;
    if (keys.w)
      this.pong.leftPaddle.move(-paddleSpeed, this.gameContainer.height);
    if (keys.s)
      this.pong.leftPaddle.move(paddleSpeed, this.gameContainer.height);
    if (keys.ArrowUp)
      this.pong.rightPaddle.move(-paddleSpeed, this.gameContainer.height);
    if (keys.ArrowDown)
      this.pong.rightPaddle.move(paddleSpeed, this.gameContainer.height);
  }

  private startBandroll(winner: string, callback: () => void) {
    this.bandrollText = `🏆 ${winner} wins! 🏆`;
    this.bandrollX = this.gameContainer.width;
    this.bandrollActive = true;

    const animate = () => {
      this.ctx.clearRect(
        0,
        0,
        this.gameContainer.width,
        this.gameContainer.height,
      );
      this.ctx.font = `bold ${Math.floor(this.gameContainer.height * 0.08)}px monospace`;
      this.ctx.fillStyle = 'yellow';
      this.ctx.textAlign = 'left';
      this.ctx.textBaseline = 'middle';
      this.ctx.fillText(
        this.bandrollText,
        this.bandrollX,
        this.gameContainer.height / 2,
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
