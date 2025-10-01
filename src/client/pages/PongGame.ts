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
  public initializeGame(
    ctx: CanvasRenderingContext2D,
    isLocal: boolean, //TMP VAR
  ): IPongGame {
    const missingElements: string[] = [];
    const getHTMLElement = (name: string) => {
      const value = document.getElementById(name) as HTMLElement;
      if (!value) missingElements.push(name);
      return value;
    };
    const {isOpponentBlocked, players, user} = this.store.getState();
    if (!user) throw new Error(`User not found`);
    if (!players || players.length !== 2) {
      throw new Error(`Players data not found or invalid`);
    }

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
        avatar: user.avatar ? user.avatar : '',
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

      // For local games, use the same user data for opponent
      // For remote games, use the other player's data
      const op = isLocal
        ? user
        : user.id === players[0].id
          ? players[1]
          : players[0];

      const opponent: IPlayer = {
        id: isLocal ? user.id : op.id,
        username: isLocal
          ? user.username
          : isOpponentBlocked
            ? 'Unavailable'
            : op.username,
        avatar: isLocal
          ? user.avatar
            ? user.avatar
            : ''
          : isOpponentBlocked
            ? ''
            : op.avatar,
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

      // Set avatars and names
      const playerAvatarElement =
        user.id === players[0].id
          ? (getHTMLElement('left_pic') as HTMLImageElement)
          : (getHTMLElement('right_pic') as HTMLImageElement);
      playerAvatarElement.src = player.avatar;
      player.nameElement.innerHTML = player.username;

      const opponentAvatarElement =
        user.id === players[0].id
          ? (getHTMLElement('right_pic') as HTMLImageElement)
          : (getHTMLElement('left_pic') as HTMLImageElement);
      opponentAvatarElement.src = opponent.avatar;
      opponent.nameElement.innerHTML = opponent.username;

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
      isLocal,
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
    const isLocal = false;

    const pong = this.initializeGame(ctx, isLocal);
    this.handleInput(pong);
    const pongCanvas = PongCanvas.getInstance(pong);

    const {matchStartBallData} = this.store.getState();
    if (matchStartBallData)
      pong.ball.setDirection(matchStartBallData.dx, matchStartBallData.dy);

    pong.gameStarted = true;
    pongCanvas.startGame();
  }

  render(): HTMLElement | undefined {
    const container = DOMUtils.createElement('div', {
      className: 'w-screen h-screen flex items-center gap-10 py-16',
    });
    const game = DOMUtils.createElement('div', {
      className: 'h-full flex-1 flex flex-wrap gap-10',
    });
    game.appendChild(renderPong());

    container.appendChild(game);
    const chat = new Chat().render();
    if (chat) container.appendChild(chat);

    requestAnimationFrame(() => {
      this.renderGameCanvas();
    });

    return container;
  }
}
