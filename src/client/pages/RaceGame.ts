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
import {keys} from '../utils/keys';

export class RaceGame extends BaseComponent {
  private raceGameUI?: RaceGameUI;

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
        ? {id: 0, username: 'Unknown', avatar: ''}
        : user.id === players[0]?.id
          ? players[1]
          : players[0];

      const opponent: IPlayer = {
        id: op.id,
        username: isOpponentBlocked ? 'Unknown' : op.username,
        avatar: isOpponentBlocked ? '' : op.avatar,
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
    document.addEventListener('keydown', (e: KeyboardEvent) => {
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
    });

    document.addEventListener('keyup', (e: KeyboardEvent) => {
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
    });
  }

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

    const isLocal = this.store.getState().game.isLocal;

    const race = this.initializeGame(ctx, isLocal); // Initialize game state
    const raceCanvas = RaceCanvas.getInstance(race); // Create canvas controller
    this.handleInput(race); //Binds click events to the keyboard events for car controls

    this.raceGameUI?.initializePlayerInfo();

    const {game} = this.store.getState();
    race.gameStarted = true;
    if (!game.isLocal) {
      const gameStartTime = game.startTime;
      const currentTime = Date.now();
      if (currentTime >= gameStartTime) {
        raceCanvas.startGame();
      } else {
        const delay = gameStartTime - currentTime;
        setTimeout(() => {
          raceCanvas.startGame();
        }, delay);
      }
    } else raceCanvas.startGame();
  }

  render(): HTMLElement {
    const container = DOMUtils.createElement('div', {
      className: 'w-screen h-screen flex items-center gap-10 py-16',
    });

    this.raceGameUI = new RaceGameUI();
    const gameElement = this.raceGameUI.render();
    container.appendChild(gameElement);

    const chat = new Chat().render();
    if (chat) container.appendChild(chat);

    requestAnimationFrame(() => {
      this.renderRacecarCanvas();
    }); // Initialize game after render

    return container;
  }
}
