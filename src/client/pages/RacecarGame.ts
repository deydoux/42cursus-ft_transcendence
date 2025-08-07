import '../styles/race-page.css';
import {handleInput, initializeGame} from '../utils/race-content';
import {BaseComponent} from '../components/BaseComponent';
import {Chat} from '../containers/Chat';
import {DOMUtils} from '../utils/dom';
import {RaceCanvas} from '../containers/raceCanvas';
import {renderCar} from '../containers/renderRace';

export class RacecarGame extends BaseComponent {
  private renderRacecarCanvas() {
    const canvas = document.getElementById('race') as HTMLCanvasElement;
    if (!canvas) {
      console.error('Could not find canvas element');
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get canvas context');
      return;
    }
    canvas.width = 1920;
    canvas.height = 1080;
    ctx.imageSmoothingEnabled = true;

    // Initialize game state
    const race = initializeGame(ctx);

    // Create canvas controller
    const raceCanvas = new RaceCanvas(race);

    // Show start message
    raceCanvas.displayStartMessage();

    handleInput(race, () => {
      raceCanvas.startGame();
    });
  }

  render(): HTMLElement | undefined {
    const container = DOMUtils.createElement('div', {
      className: 'w-screen h-screen flex items-center gap-10 py-16',
    });

    const game = DOMUtils.createElement('div', {
      className: 'h-full flex-1 flex flex-wrap gap-10',
    });
    game.appendChild(renderCar());
    this.renderRacecarCanvas();

    container.appendChild(game);
    const chat = new Chat().render();
    if (chat) container.appendChild(chat);
    return container;
  }
}
