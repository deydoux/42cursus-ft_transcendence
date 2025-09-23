import {handleInput, initializeGame} from '../utils/content';
import {BaseComponent} from '../components/BaseComponent';
import {Chat} from '../containers/chat/Chat';
import {DOMUtils} from '../utils/dom';
import {PongCanvas} from '../containers/pongCanvas';
import {renderPong} from '../containers/renderPong';
import { Timer } from '../containers/timer';
import { keys } from '../utils/keys';

export class PongGame extends BaseComponent {
  public initializeGame(ctx: CanvasRenderingContext2D): PongGame {
    const missingElements: string[] = [];
      const getHTMLElement = (name: string) => {
        const value = document.getElementById(name) as HTMLElement;
        if (!value) missingElements.push(name);
        return value;
      };
    const leftPlayer = getHTMLElement('p1_name');
    const rightPlayer = getHTMLElement('p2_name');
    const leftPlayerScoreElement = getHTMLElement('p1_score');
    const rightPlayerScoreElement = getHTMLElement('p2_score');
    if (missingElements.length > 0) {
      throw new Error(
        `Required HTML elements not found: ${missingElements.join(', ')}`,
      );
    }
    const initializePlayers () => {
      const {isOponentBlocked} = this.store.getState();
      const {user} = this.store.getState();

    

    }
    const leftPaddle = new Paddle(
      ctx,
      10,
      (ctx.canvas.height - ctx.canvas.height * 0.25) / 2,
    );
    const rightPaddle = new Paddle(
      ctx,
      ctx.canvas.width - 10 - leftPaddle.width,
      (ctx.canvas.height - ctx.canvas.height * 0.25) / 2,
    );
    const ball = new Ball(ctx);
  
    return {
      player,
      opponent,
      ctx,
      ball,
      leftPlayerScoreElement,
      rightPlayerScoreElement,
      leftPlayerScore: 0,
      rightPlayerScore: 0,
      keys: {...keys},
      gameStarted: false,
      isScoring: false,
      timer: new Timer(),
    };
  }
  
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
