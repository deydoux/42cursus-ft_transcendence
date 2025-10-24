import {PongCanvas} from '../containers/pong/pongCanvas';
import {RaceCanvas} from '../containers/race/raceCanvas';
import {Store} from '../services/store';

// Define the confetti function interface
interface ConfettiOptions {
  particleCount?: number;
  startVelocity?: number;
  spread?: number;
  ticks?: number;
  zIndex?: number;
  origin?: {
    x?: number;
    y?: number;
  };
}

type ConfettiFunction = (options?: ConfettiOptions) => void;

declare const confetti: ConfettiFunction;

export const welcomeEmojis = [
  '👋',
  '🤌',
  '🙏',
  '🙌',
  '🎉',
  '💐',
  '🏓',
  '🌞',
  '🎮',
  '👾',
  '🕹️',
  '🎀',
  '🌸',
  '🔫',
  '🍑',
];

/**
 * Displays a countdown message on the canvas
 * @param message The countdown message to display
 */
export function displayCountdownMessage(
  ctx: CanvasRenderingContext2D,
  color: string,
  message: string,
): void {
  ctx.save();

  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  const baseFontSize = Math.max(width, height) * 0.08;

  // Center of canvas
  const centerX = width / 2;
  const centerY = height / 2;

  ctx.font = `bold ${baseFontSize}px monospace`;
  ctx.fillStyle = message === 'GO!' ? '#d23095' : color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowBlur = 20;
  ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';

  ctx.fillText(message, centerX, centerY);

  ctx.restore();
}

export function startWinnerCelebration(): void {
  // Check if confetti is available
  if (typeof confetti !== 'function') {
    console.error('Confetti library not available');
    return;
  }

  const duration = 15 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults: ConfettiOptions = {
    startVelocity: 30,
    spread: 360,
    ticks: 60,
    zIndex: 9999,
  };

  const randomInRange = (min: number, max: number): number => {
    return Math.random() * (max - min) + min;
  };

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = Math.floor(50 * (timeLeft / duration));

    try {
      // Create confetti bursts from both sides
      confetti({
        ...defaults,
        particleCount,
        origin: {x: randomInRange(0.1, 0.3), y: Math.random() - 0.2},
      });

      confetti({
        ...defaults,
        particleCount,
        origin: {x: randomInRange(0.7, 0.9), y: Math.random() - 0.2},
      });
    } catch (error) {
      console.error('Error firing confetti:', error);
      clearInterval(interval);
    }
  }, 250);
}

export const getCurrentGame = () => {
  const {game} = Store.getInstance().getState();
  if (!game) throw new Error('failed to fetch game state');
  return game;
};

export const getPongCanvasInstance = (gameId?: string) => {
  const game = getCurrentGame();
  const id = gameId || game.id.toString();
  const pongCanvas = PongCanvas.getInstance(id);
  if (!pongCanvas)
    throw new Error(`pongCanvas instance not found for gameId: ${id}`);
  return pongCanvas;
};

export const getRaceCanvasInstance = (gameId?: string) => {
  const game = getCurrentGame();
  const id = gameId || game.id.toString();
  const raceCanvas = RaceCanvas.getInstance(id);
  if (!raceCanvas)
    throw new Error(`raceCanvas instance not found for gameId: ${id}`);
  return raceCanvas;
};
