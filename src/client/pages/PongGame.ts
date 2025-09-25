import {Ball} from '../containers/ball';
import {BaseComponent} from '../components/BaseComponent';
import {Chat} from '../containers/chat/Chat';
import {DOMUtils} from '../utils/dom';
import {IPlayer} from '../types/game';
import {IPongGame} from '../types/game';
import {Paddle} from '../containers/paddle';
import {PongCanvas} from '../containers/pongCanvas';
import {Timer} from '../containers/timer';
import {keys} from '../utils/keys';
import {renderPong} from '../containers/renderPong';

export class PongGame extends BaseComponent {
  public initializeGame(ctx: CanvasRenderingContext2D): IPongGame {
    const missingElements: string[] = [];
    const getHTMLElement = (name: string) => {
      const value = document.getElementById(name) as HTMLElement;
      if (!value) missingElements.push(name);
      return value;
    };
    const {isOpponentBlocked} = this.store.getState();
    const {user} = this.store.getState();
    if (!user) throw new Error(`User not found`);
    const {players} = this.store.getState();

    const initializePlayers = () => {
      const playerPaddleX =
        user.id === players[0].id
          ? 10
          : ctx.canvas.width - 10 - ctx.canvas.width * 0.015;
      const opponentPaddleX =
        user.id === players[0].id
          ? ctx.canvas.width - 10 - ctx.canvas.width * 0.01
          : 10;
      const player: IPlayer = {
        id: user.id,
        username: user.username,
        avatar: user.hasAvatar ? user.avatar : '',
        score: 0,
        paddle: new Paddle(
          ctx,
          playerPaddleX,
          (ctx.canvas.height - ctx.canvas.height * 0.25) / 2,
        ),
        car: null,
        nameElement:
          user.id === players[0].id
            ? getHTMLElement('left_name')
            : getHTMLElement('right_name'),
        scoreElement:
          user.id === players[0].id
            ? getHTMLElement('left_score')
            : getHTMLElement('right_score'),
        side: user.id === players[0].id ? 'left' : 'right',
      };
      const playerAvatarElement =
        user.id === players[0].id
          ? getHTMLElement('left_pic')
          : getHTMLElement('right_pic');
      playerAvatarElement.innerHTML = player.avatar;

      const op = user.id === players[0].id ? players[1] : players[0];
      const opponent: IPlayer = {
        id: op.id,
        username: isOpponentBlocked ? 'Unavailable' : op.username,
        avatar: isOpponentBlocked ? '' : op.avatar,
        score: 0,
        paddle: new Paddle(
          ctx,
          opponentPaddleX,
          (ctx.canvas.height - ctx.canvas.height * 0.25) / 2,
        ),
        car: null,
        nameElement:
          user.id === players[0].id
            ? getHTMLElement('right_name')
            : getHTMLElement('left_name'),
        scoreElement:
          user.id === players[0].id
            ? getHTMLElement('right_score')
            : getHTMLElement('left_score'),
        side: user.id === players[0].id ? 'right' : 'left',
      };
      const opponentAvatarElement =
        user.id === players[0].id
          ? getHTMLElement('right_pic')
          : getHTMLElement('left_pic');
      opponentAvatarElement.innerHTML = op.avatar;

      if (missingElements.length > 0) {
        throw new Error(
          `Required HTML elements not found: ${missingElements.join(', ')}`,
        );
      }

      return {player, opponent};
    };

    const ball = new Ball(ctx);

    const {player, opponent} = initializePlayers();

    return {
      player,
      opponent,
      ctx,
      ball,
      keys: {...keys},
      gameStarted: false,
      isScoring: false,
      timer: new Timer(),
      isLocal: false,
    };
  }

  private handleInput(pong: IPongGame) {
    document.addEventListener('keydown', e => {
      if (e.key === 'w' || e.key === 'W') pong.keys.w = true;
      if (e.key === 's' || e.key === 'S') pong.keys.s = true;
      if (e.key === 'ArrowUp') pong.keys.ArrowUp = true;
      if (e.key === 'ArrowDown') pong.keys.ArrowDown = true;
    });

    document.addEventListener('keyup', e => {
      if (e.key === 'w' || e.key === 'W') pong.keys.w = false;
      if (e.key === 's' || e.key === 'S') pong.keys.s = false;
      if (e.key === 'ArrowUp') pong.keys.ArrowUp = false;
      if (e.key === 'ArrowDown') pong.keys.ArrowDown = false;
    });
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

    const pong = this.initializeGame(ctx);
    const pongCanvas = PongCanvas.getInstance(pong);
    pongCanvas.displayStartMessage();

    this.handleInput(pong);
    PongCanvas.getInstance().startGame();
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
