import {Ball} from '../containers/pong/ball';
import {BaseComponent} from '../components/BaseComponent';
import {Chat} from '../containers/chat/Chat';
import {DOMUtils} from '../utils/dom';
import {IPlayer} from '../types/game';
import {IPongGame} from '../types/game';
import {Paddle} from '../containers/pong/paddle';
import {PongCanvas} from '../containers/pong/pongCanvas';
import {PongGameUI} from '../containers/pong/PongGameUI';
import {Timer} from '../containers/timer';
import {getCurrentGame} from '../utils/content';
import {keys} from '../utils/keys';
export class PongGame extends BaseComponent {
  private pongGameUI?: PongGameUI;
  private pongCanvas?: PongCanvas;
  private keyHandlers: {
    keydown: (e: KeyboardEvent) => void;
    keyup: (e: KeyboardEvent) => void;
  } | null = null;

  public initializeGame(
    ctx: CanvasRenderingContext2D,
    isLocal: boolean,
  ): IPongGame {
    const missingElements: string[] = [];
    const getHTMLElement = (name: string) => {
      const value = document.getElementById(name) as HTMLElement;
      if (!value) missingElements.push(name);
      return value;
    };
    const {isOpponentBlocked, game, user} = this.store.getState();
    if (!user) throw new Error(`User not found`);
    const players = game.players;

    const initializePlayers = () => {
      const playerPaddleX = isLocal
        ? 10
        : user.id === players[0]?.id
          ? 10
          : ctx.canvas.width - 10 - ctx.canvas.width * 0.015;
      const opponentPaddleX = isLocal
        ? ctx.canvas.width - 10 - ctx.canvas.width * 0.015
        : user.id === players[0]?.id
          ? ctx.canvas.width - 10 - ctx.canvas.width * 0.015
          : 10;

      const player: IPlayer = {
        id: user.id,
        username: user.username,
        avatar: user.avatar ? user.avatar : '',
        score: 0,
        paddle: new Paddle(
          ctx,
          playerPaddleX,
          (ctx.canvas.height - ctx.canvas.height * 0.25) / 2,
        ),
        car: null,
        scoreElement: isLocal
          ? getHTMLElement('left_score')
          : user.id === players[0]?.id
            ? getHTMLElement('left_score')
            : getHTMLElement('right_score'),
        side: isLocal ? 'left' : user.id === players[0]?.id ? 'left' : 'right',
      };
      const op = isLocal
        ? {id: 0, username: 'Unknown', avatar: ''}
        : user.id === players[0]?.id
          ? players[1]
          : players[0];

      const opponent: IPlayer = {
        id: op.id,
        username: isOpponentBlocked ? 'Unknown' : op.username,
        avatar: isOpponentBlocked ? '' : op.avatar,
        score: 0,
        paddle: new Paddle(
          ctx,
          opponentPaddleX,
          (ctx.canvas.height - ctx.canvas.height * 0.25) / 2,
        ),
        car: null,
        scoreElement: isLocal
          ? getHTMLElement('right_score')
          : user.id === players[0]?.id
            ? getHTMLElement('right_score')
            : getHTMLElement('left_score'),
        side: isLocal ? 'right' : user.id === players[0]?.id ? 'right' : 'left',
      };
      return {player, opponent};
    };

    const ball = new Ball(ctx);
    const {player, opponent} = initializePlayers();
    if (missingElements.length > 0) {
      const errorMessage = `Missing HTML elements: ${missingElements.join(', ')}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }
    return {
      player,
      opponent,
      ctx,
      ball,
      keys: {...keys},
      gameStarted: false,
      isScoring: false,
      timer: new Timer(),
      isLocal,
    };
  }

  public cleanup(): void {
    // Stop and cleanup the canvas instance
    if (this.pongCanvas) {
      this.pongCanvas.cleanup();
      this.pongCanvas = undefined;
    }

    // Clear the specific instance from static map
    const {game} = this.store.getState();
    if (game?.id) {
      PongCanvas.clearInstance(game.id.toString());
    }

    // Remove key handlers
    this.removeKeyHandlers();

    console.log('PongGame cleaned up');
  }

  public destroy(): void {
    this.cleanup();
  }

  private handleInput(pong: IPongGame) {
    // Remove existing event listeners first
    this.removeKeyHandlers();

    // Helper function to check if user is typing in chat
    const isChatInputFocused = (): boolean => {
      const activeElement = document.activeElement;

      // Check if it's an HTMLElement first, then check contentEditable
      const isContentEditable =
        activeElement instanceof HTMLElement &&
        activeElement.contentEditable === 'true';

      return (
        activeElement?.tagName === 'INPUT' ||
        activeElement?.tagName === 'TEXTAREA' ||
        isContentEditable ||
        activeElement?.closest('.chat-input') !== null ||
        activeElement?.closest('.search-input') !== null
      );
    };

    // Create new handlers
    const keydownHandler = (e: KeyboardEvent) => {
      if (isChatInputFocused()) return; // Don't handle game keys if user is typing in chat

      if (e.key === 'w' || e.key === 'W') pong.keys.w = true;
      if (e.key === 's' || e.key === 'S') pong.keys.s = true;
      if (e.key === 'ArrowUp') pong.keys.ArrowUp = true;
      if (e.key === 'ArrowDown') pong.keys.ArrowDown = true;
    };

    const keyupHandler = (e: KeyboardEvent) => {
      if (isChatInputFocused()) return; // Don't handle game keys if user is typing in chat

      if (e.key === 'w' || e.key === 'W') pong.keys.w = false;
      if (e.key === 's' || e.key === 'S') pong.keys.s = false;
      if (e.key === 'ArrowUp') pong.keys.ArrowUp = false;
      if (e.key === 'ArrowDown') pong.keys.ArrowDown = false;
    };

    // Store handlers for cleanup
    this.keyHandlers = {keydown: keydownHandler, keyup: keyupHandler};

    // Add event listeners
    document.addEventListener('keydown', keydownHandler);
    document.addEventListener('keyup', keyupHandler);
  }

  private removeKeyHandlers(): void {
    if (this.keyHandlers) {
      document.removeEventListener('keydown', this.keyHandlers.keydown);
      document.removeEventListener('keyup', this.keyHandlers.keyup);
      this.keyHandlers = null;
    }
  }

  private renderGameCanvas() {
    if (!this.pongGameUI) {
      console.error('PongGameUI not initialized');
      return;
    }

    this.cleanup(); //cleanup previous instance

    const game = getCurrentGame();
    const canvas = this.pongGameUI.initializeCanvas(); // Use PongGameUI to set up the canvas
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get canvas context');
      return;
    }

    const pong = this.initializeGame(ctx, game.isLocal);
    this.pongCanvas = PongCanvas.createInstance(pong, game.id.toString());
    this.handleInput(pong);
    this.pongGameUI?.initializePlayerInfo();

    const {matchStartBallData} = this.store.getState();
    if (matchStartBallData)
      pong.ball.setDirection(matchStartBallData.dx, matchStartBallData.dy);

    pong.gameStarted = true;
    if (!game.isLocal) {
      const gameStartTime = game.startTime;
      const currentTime = Date.now();
      if (currentTime >= gameStartTime) {
        this.pongCanvas.startGame();
      } else {
        const delay = gameStartTime - currentTime;
        setTimeout(() => {
          this.pongCanvas?.startGame();
        }, delay);
      }
    } else this.pongCanvas.startGame();
  }

  render(): HTMLElement {
    const container = DOMUtils.createElement('div', {
      className:
        'w-screen h-screen flex items-center gap-10 py-16 overflow-hidden',
    });

    this.pongGameUI = new PongGameUI();
    const gameElement = this.pongGameUI.render();
    container.appendChild(gameElement);

    const chat = new Chat().render();
    if (chat) container.appendChild(chat);

    requestAnimationFrame(() => {
      this.renderGameCanvas();
    }); // Initialize game after render

    return container;
  }
}
