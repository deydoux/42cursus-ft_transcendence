import {IPlayer, IRaceGame} from '../types/game';
import {BaseComponent} from '../components/BaseComponent';
import {Car} from '../containers/race/car';
import {Chat} from '../containers/chat/Chat';
import {Checkpoint} from '../containers/race/checkpoint';
import {DOMUtils} from '../utils/dom';
import {RaceCanvas} from '../containers/race/raceCanvas';
import {RaceGameUI} from '../containers/race/RaceGameUI';
import {Timer} from '../containers/timer';
import {Track} from '../containers/race/track';
import {Wall} from '../containers/race/wall';
import carOpponent from '../assets/car_opponent.svg';
import carPlayer from '../assets/car_player.svg';
import {getCurrentGame} from '../utils/content';
import {keys} from '../utils/keys';

export class RaceGame extends BaseComponent {
  private raceGameUI?: RaceGameUI;
  private raceCanvas?: RaceCanvas;
  private keyHandlers: {
    keydown: (e: KeyboardEvent) => void;
    keyup: (e: KeyboardEvent) => void;
  } | null = null;

  /**
   * Initializes the game state with the provided canvas context.
   * Sets up the track, cars, walls, checkpoints, and other game elements.
   * @param ctx The canvas rendering context
   * @returns The initialized RaceGame object
   */
  private initializeGame(
    ctx: CanvasRenderingContext2D,
    isLocal: boolean,
  ): IRaceGame {
    const missingElements: string[] = [];
    const getHTMLElement = (name: string) => {
      const value = document.getElementById(name) as HTMLElement;
      if (!value) missingElements.push(name);
      return value;
    };

    const {isOpponentBlocked, game, user} = this.store.getState();
    if (!user) throw new Error(`User not found`);
    const players = game.players;

    const wall = new Wall(ctx);
    if (game.isLocal) wall.generateRandomWalls(20);
    else wall.walls = this.store.getState().raceWalls;

    const checkpoints: Checkpoint[] = [];
    if (game.isLocal)
      checkpoints.push(
        Checkpoint.createRandomCheckpoint(ctx, wall, checkpoints),
      );

    const initializePlayers = () => {
      const playerCarX = isLocal
        ? ctx.canvas.width * 0.1
        : user.id === players[0]?.id
          ? ctx.canvas.width * 0.1
          : ctx.canvas.width * 0.9;
      const playerCarY = isLocal
        ? ctx.canvas.height * 0.1
        : user.id === players[0]?.id
          ? ctx.canvas.height * 0.1
          : ctx.canvas.height * 0.9;

      const opponentCarX = isLocal
        ? ctx.canvas.width * 0.9
        : user.id === players[0]?.id
          ? ctx.canvas.width * 0.9
          : ctx.canvas.width * 0.1;
      const opponentCarY = isLocal
        ? ctx.canvas.height * 0.9
        : user.id === players[0]?.id
          ? ctx.canvas.height * 0.9
          : ctx.canvas.height * 0.1;

      const player: IPlayer = {
        id: user.id,
        username: user.username,
        avatar: user.avatar ? user.avatar : '',
        score: 0,
        paddle: null,
        car: new Car(ctx, playerCarX, playerCarY, '#ff0000', carPlayer),
        scoreElement: isLocal
          ? getHTMLElement('left_score')
          : user.id === players[0]?.id
            ? getHTMLElement('left_score')
            : getHTMLElement('right_score'),
        side: isLocal ? 'left' : user.id === players[0]?.id ? 'left' : 'right',
      };

      const op = isLocal
        ? {id: 0, username: 'Guest', avatar: '/static/guest.webp'}
        : user.id === players[0]?.id
          ? players[1]
          : players[0];

      const opponent: IPlayer = {
        id: op.id,
        username: isOpponentBlocked ? 'Unknown' : op.username,
        avatar: isOpponentBlocked ? '/static/guest.webp' : op.avatar,
        score: 0,
        paddle: null,
        car: new Car(ctx, opponentCarX, opponentCarY, '#ffff00', carOpponent),
        scoreElement: isLocal
          ? getHTMLElement('right_score')
          : user.id === players[0]?.id
            ? getHTMLElement('right_score')
            : getHTMLElement('left_score'),
        side: isLocal ? 'right' : user.id === players[0]?.id ? 'right' : 'left',
      };

      return {player, opponent};
    };

    const {player, opponent} = initializePlayers();
    const timerDisplay = getHTMLElement('race_timer');

    if (missingElements.length > 0) {
      const errorMessage = `Missing HTML elements: ${missingElements.join(', ')}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    return {
      player,
      opponent,
      track: new Track(ctx),
      timer: new Timer(),
      wall,
      gameStarted: false,
      keys: keys,
      ctx: ctx,
      isLocal,
      timerDisplay,
      checkpoints,
      lastCheckpointTime: null,
      currentGrowpoint: null,
      lastGrowpointTime: null,
      currentSlowpoint: null,
      lastSlowpointTime: null,
    };
  }

  /**
   * Handles user input to control the cars.
   * Binds click events to the keyboard events for car controls.
   * @param race The RaceGame instance to control
   * @param onStart Callback function to start the game loop
   */
  private handleInput(race: IRaceGame): void {
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

      // Car 1 controls (WASD)
      if (e.key === 'w' || e.key === 'W') race.keys.w = true;
      if (e.key === 'a' || e.key === 'A') race.keys.a = true;
      if (e.key === 's' || e.key === 'S') race.keys.s = true;
      if (e.key === 'd' || e.key === 'D') race.keys.d = true;

      // Car 2 controls (Arrow Keys)
      if (e.key === 'ArrowUp') race.keys.ArrowUp = true;
      if (e.key === 'ArrowLeft') race.keys.ArrowLeft = true;
      if (e.key === 'ArrowDown') race.keys.ArrowDown = true;
      if (e.key === 'ArrowRight') race.keys.ArrowRight = true;
    };

    const keyupHandler = (e: KeyboardEvent) => {
      if (isChatInputFocused()) return; // Don't handle game keys if user is typing in chat

      // Car 1 controls (WASD)
      if (e.key === 'w' || e.key === 'W') race.keys.w = false;
      if (e.key === 'a' || e.key === 'A') race.keys.a = false;
      if (e.key === 's' || e.key === 'S') race.keys.s = false;
      if (e.key === 'd' || e.key === 'D') race.keys.d = false;

      // Car 2 controls (Arrow Keys)
      if (e.key === 'ArrowUp') race.keys.ArrowUp = false;
      if (e.key === 'ArrowLeft') race.keys.ArrowLeft = false;
      if (e.key === 'ArrowDown') race.keys.ArrowDown = false;
      if (e.key === 'ArrowRight') race.keys.ArrowRight = false;
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

  public cleanup(): void {
    // Stop and cleanup the canvas instance
    if (this.raceCanvas) {
      this.raceCanvas.cleanup();
      this.raceCanvas = undefined;
    }

    // Clear the specific instance from static map
    const {game} = this.store.getState();
    if (game?.id) {
      RaceCanvas.clearInstance(game.id.toString());
    }

    // Remove key handlers
    this.removeKeyHandlers();

    console.log('RaceGame cleaned up');
  }

  public destroy(): void {
    this.cleanup();
  }

  private renderRacecarCanvas() {
    if (!this.raceGameUI) {
      console.error('RaceGameUI not initialized');
      return;
    }

    this.cleanup();

    const game = getCurrentGame();
    const canvas = this.raceGameUI.initializeCanvas();
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('Could not get canvas context');
      return;
    }

    const race = this.initializeGame(ctx, game.isLocal); // Initialize game state
    this.raceCanvas = RaceCanvas.createInstance(race, game.id?.toString()); // Create canvas controller
    this.handleInput(race); //Binds click events to the keyboard events for car controls
    this.raceGameUI?.initializePlayerInfo();

    race.gameStarted = true;
    if (!game.isLocal) {
      const gameStartTime = game.startTime;
      const currentTime = Date.now();
      if (currentTime >= gameStartTime) {
        this.raceCanvas.startGame();
      } else {
        const delay = gameStartTime - currentTime;
        setTimeout(() => {
          this.raceCanvas?.startGame();
        }, delay);
      }
    } else this.raceCanvas.startGame();
  }

  render(): HTMLElement {
    const container = DOMUtils.createElement('div', {
      className: 'w-screen h-screen flex items-center gap-10 py-16',
    });

    this.raceGameUI = new RaceGameUI();
    const gameElement = this.raceGameUI.render();
    container.appendChild(gameElement);

    const chat = new Chat().render(true);
    if (chat) container.appendChild(chat);

    requestAnimationFrame(() => {
      this.renderRacecarCanvas();
    }); // Initialize game after render

    return container;
  }
}
