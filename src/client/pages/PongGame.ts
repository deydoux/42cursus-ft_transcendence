import {handleInput, initializeGame} from '../utils/content';
import {BaseComponent} from '../components/BaseComponent';
import {Chat} from '../containers/Chat';
import {DOMUtils} from '../utils/dom';
import {PongCanvas} from '../containers/pongCanvas';
import {renderPong} from '../containers/renderPong';

export class PongGame extends BaseComponent {
  private renderGameCanvas() {
    const canvas = document.getElementById('pong') as HTMLCanvasElement;
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

    const pong = initializeGame(ctx);
    const pongCanvas = new PongCanvas(pong);
    pongCanvas.displayStartMessage();

    handleInput(pong, () => {
      pongCanvas.startGame();
    });
  }

  render(): HTMLElement | undefined {
    const container = DOMUtils.createElement('div', {
      className: 'w-screen h-screen flex items-center gap-10 py-16',
    });
    const game = DOMUtils.createElement('div', {
      className: 'h-full flex-1 flex flex-wrap gap-10',
    });
    game.appendChild(renderPong());
    this.renderGameCanvas();

    container.appendChild(game);
    const chat = new Chat().render();
    if (chat) container.appendChild(chat);
    return container;
  }
}
