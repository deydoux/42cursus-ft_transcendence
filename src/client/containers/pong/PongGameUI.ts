import {
  getCurrentGame,
  getPongCanvasInstance,
  startWinnerCelebration,
} from '../../utils/content';
import {BaseComponent} from '../../components/BaseComponent';
import {DOMUtils} from '../../utils/dom';
import {IPlayer} from '../../types/game';
import {PongCanvas} from './pongCanvas';
import {Router} from '../../services/router';
import {User} from '../../handlers/game';
import unknow_avatar from '../../assets/unknown-avatar.jpeg';

interface PongGameUIElement extends HTMLElement {
  showGameEndModal(data: {
    winner: number;
    result?: string;
    eloChange?: number;
  }): void;
}

export class PongGameUI extends BaseComponent {
  private gameEndModal?: HTMLElement;
  protected router = Router.getInstance();

  render(): HTMLElement {
    const container = DOMUtils.createElement('div', {
      className: 'h-full flex-1 flex flex-col gap-4 max-w-full',
    }) as unknown as PongGameUIElement;

    // Fix: Proper typing instead of 'any'
    container.showGameEndModal = this.showGameEndModal.bind(this);
    container.classList.add('pong-game-ui');

    // Game header with enhanced player info
    container.appendChild(this.renderGameHeader());

    // Main game area with canvas
    container.appendChild(this.renderGameArea());

    // Game end modal (hidden initially)
    this.gameEndModal = this.renderGameEndModal();
    container.appendChild(this.gameEndModal);

    return container;
  }

  private renderGameHeader(): HTMLElement {
    const header = DOMUtils.createElement('div', {
      attributes: {id: 'game-header'},
      className:
        'flex justify-between items-center p-3 bg-white/5 border border-white/20 gap-10 rounded-lg',
    });

    // Left player info
    const leftPlayer = DOMUtils.createElement('div', {
      className: 'flex items-start gap-4 md:items-center',
    });

    leftPlayer.innerHTML = `
      <img id="left_pic" class="w-16 h-16 rounded-full self-start md:self-center" src="" alt="Player">
      <div class="flex flex-col justify-start md:justify-center">
      <div id="left_name" class="text-xl font-bold text-white"></div>
      </div>
    `;

    // Score display
    const scoreDisplay = DOMUtils.createElement('div', {
      className:
        'flex h-full self-stretch items-end md:items-center justify-center gap-6 text-3xl md:text-4xl font-bold',
    });
    scoreDisplay.innerHTML = `
      <span id="left_score">0</span>
      <span class="text-gray-500">|</span>
      <span id="right_score">0</span>
    `;

    // Right player info
    const rightPlayer = DOMUtils.createElement('div', {
      className: 'flex items-start gap-4 flex-row-reverse md:items-center',
    });
    rightPlayer.innerHTML = `
      <img id="right_pic" class="w-16 h-16 rounded-full self-start md:self-center" src="" alt="Player">
      <div class="flex flex-col justify-start md:justify-center text-right">
      <div id="right_name" class="text-xl font-bold text-white"></div>
      </div>
    `;

    header.appendChild(leftPlayer);
    header.appendChild(scoreDisplay);
    header.appendChild(rightPlayer);

    return header;
  }

  private renderGameArea(): HTMLElement {
    const gameArea = DOMUtils.createElement('div', {
      className: 'flex-1 flex justify-center items-center overflow-hidden',
    });

    const canvas = DOMUtils.createElement('canvas', {
      attributes: {id: 'pong'},
      className:
        'w-full h-auto bg-linear-to-br from-pink-200 to-pink-300 shadow-lg shadow-pink-300/30 rounded-lg',
    }) as HTMLCanvasElement;

    gameArea.appendChild(canvas);
    return gameArea;
  }

  private renderGameEndModal(): HTMLElement {
    const modal = DOMUtils.createElement('div', {
      attributes: {id: 'game-end-modal'},
      className:
        'fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 hidden',
    });

    const content = DOMUtils.createElement('div', {
      className:
        'bg-pink-200 rounded-lg p-8 max-w-xl w-full mx-4 text-center text-shadow-lg/30',
    });

    // Modal content will be populated dynamically in showGameEndModal
    modal.appendChild(content);
    return modal;
  }

  public showGameEndModal(data: {
    winner: number;
    result?: string;
    eloChange?: number;
  }): void {
    const pongCanvas = getPongCanvasInstance();
    const {user} = this.store.getState();
    if (!user) throw new Error('user not found');

    let players;
    if (!pongCanvas.pong.isLocal) {
      players = this.store.getState().game.players;
    } else {
      players = [pongCanvas.pong.player, pongCanvas.pong.opponent];
    }
    if (!players || !this.gameEndModal) return;

    // Hide canvas
    const canvas = document.getElementById('pong');
    if (canvas) canvas.style.display = 'none';

    const isWinner = data.winner === user.id;
    const isRanked = getCurrentGame().isRanked;
    const opponent = players.find(p => p.id !== user.id);

    const userScore =
      document.getElementById(
        user.id === players[0].id ? 'left_score' : 'right_score',
      )?.textContent || '0';
    const opponentScore =
      document.getElementById(
        user.id === players[0].id ? 'right_score' : 'left_score',
      )?.textContent || '0';

    const content = this.gameEndModal.querySelector('div');
    if (!content) return;

    content.innerHTML = `
      <h2 class="text-3xl font-bold mb-6 ${isWinner ? 'text-green-400' : 'text-red-400'}">
        ${isWinner ? 'Victory!' : 'Defeat!'}
      </h2>

      <div class="flex justify-between items-center mb-6">
        <div class="flex flex-col items-center">
          <img class="w-20 h-20 rounded-full mb-2 border-2 ${isWinner ? 'border-green-400' : 'border-red-400'}"
               src="${user.avatar || unknow_avatar}" alt="${user.username}">
          <div class="font-bold text-white">${user.username}</div>
          ${!pongCanvas.pong.isLocal && isRanked ? `<div class="text-sm text-black mb-2">ELO: ${user.elo}</div>` : ''}
      ${
        data.eloChange && !pongCanvas.pong.isLocal && isRanked
          ? `<div class="text-sm ${isWinner ? 'text-green-400' : 'text-red-400'} font-bold">
        ${isWinner ? '+' : '-'}${data.eloChange}
          </div>`
          : ''
      }
        </div>

        <div class="text-4xl font-bold text-white">
          ${userScore} - ${opponentScore}
        </div>

        <div class="flex flex-col items-center">
          <img class="w-20 h-20 rounded-full mb-2 border-2 ${!isWinner ? 'border-green-400' : 'border-red-400'}"
               src="${opponent?.avatar || unknow_avatar}" alt="${opponent?.username || 'Opponent'}">
          <div class="font-bold text-white">${opponent?.username || 'Opponent'}</div>
        </div>
      </div>

      ${data.result ? `<div class="mb-6 text-gray-300">${data.result}</div>` : ''}

      <div class="flex gap-4 justify-center">
        <button id="close-modal-btn" class="cursor-pointer bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2">
          <svg class="w-5 h-5" fill="#fda5d5" viewBox="0 0 495.398 495.398">
          <path d="M487.083,225.514l-75.08-75.08V63.704c0-15.682-12.708-28.391-28.413-28.391c-15.669,0-28.377,12.709-28.377,28.391 v29.941L299.31,37.74c-27.639-27.624-75.694-27.575-103.27,0.05L8.312,225.514c-11.082,11.104-11.082,29.071,0,40.158 c11.087,11.101,29.089,11.101,40.172,0l187.71-187.729c6.115-6.083,16.893-6.083,22.976-0.018l187.742,187.747 c5.567,5.551,12.825,8.312,20.081,8.312c7.271,0,14.541-2.764,20.091-8.312C498.17,254.586,498.17,236.619,487.083,225.514z"/>
          <path d="M257.561,131.836c-5.454-5.451-14.285-5.451-19.723,0L72.712,296.913c-2.607,2.606-4.085,6.164-4.085,9.877v120.401 c0,28.253,22.908,51.16,51.16,51.16h81.754v-126.61h92.299v126.61h81.755c28.251,0,51.159-22.907,51.159-51.159V306.79 c0-3.713-1.465-7.271-4.085-9.877L257.561,131.836z"/>
        </svg>
      Home
      </button>
      <button id="rematch-btn" class="cursor-pointer bg-gray-500 hover:bg-grey-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2">
        <svg class="w-6 h-6" version="1.1" id="Icons" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 32 32" xml:space="preserve" fill="#fda5d5"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <style type="text/css"> .st0{fill:none;stroke:#fda5d5;stroke-width:2;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:10;} </style>
        <path class="st0" d="M27,6.5v7c0,0.8-0.7,1.5-1.5,1.5h0c-0.8,0-1.5-0.7-1.5-1.5v-7C24,5.7,24.7,5,25.5,5h0C26.3,5,27,5.7,27,6.5z"></path>
        <path class="st0" d="M8,18.5v7C8,26.3,7.3,27,6.5,27h0C5.7,27,5,26.3,5,25.5v-7C5,17.7,5.7,17,6.5,17h0C7.3,17,8,17.7,8,18.5z"></path> <circle class="st0" cx="15" cy="18" r="2"></circle> <path class="st0" d="M26,30H6c-2.2,0-4-1.8-4-4V6c0-2.2,1.8-4,4-4h20c2.2,0,4,1.8,4,4v20C30,28.2,28.2,30,26,30z"></path> <line class="st0" x1="16" y1="16" x2="16" y2="2"></line> <line class="st0" x1="16" y1="30" x2="16" y2="20"></line> </g>
        </svg>
        Rematch
        </button>
      </div>
    `;

    // Show modal
    this.gameEndModal.classList.remove('hidden');

    if (isWinner && data.result !== 'tie') startWinnerCelebration();

    // Add event listeners
    this.setupModalEventListeners();
  }

  private setupModalEventListeners(): void {
    if (!this.gameEndModal) return;

    const pongCanvas = getPongCanvasInstance();
    const closeBtn = this.gameEndModal.querySelector('#close-modal-btn');
    const rematchBtn = this.gameEndModal.querySelector('#rematch-btn');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeModal();
        this.router.navigate('/homepage');
      });
    }

    if (!pongCanvas.pong.isLocal)
      (rematchBtn as HTMLElement).style.display = 'none';

    if (rematchBtn) {
      rematchBtn.addEventListener('click', () => {
        sessionStorage.setItem('validGameAccess', 'rematch');
        this.closeModal();
        this.router.navigate('/pong');
      });
    }

    // Close on backdrop click
    this.gameEndModal.addEventListener('click', e => {
      if (e.target === this.gameEndModal) {
        this.closeModal();
        this.router.navigate('/homepage');
      }
    });
  }

  private closeModal(): void {
    if (this.gameEndModal) {
      this.gameEndModal.classList.add('hidden');
    }

    // Show canvas again if needed
    const canvas = document.getElementById('pong');
    if (canvas) canvas.style.display = 'block';

    // Destroy the PongCanvas instance when navigating away
    PongCanvas.clearInstance(getCurrentGame().id.toString());
  }

  public initializePlayerInfo(): void {
    const pongCanvas = getPongCanvasInstance();
    const {user} = this.store.getState();
    if (!user) throw new Error('user not found');

    let players;
    if (!pongCanvas.pong.isLocal) {
      players = this.store.getState().game.players;
    } else {
      players = [pongCanvas.pong.player, pongCanvas.pong.opponent];
    }
    if (!players) return;
    const opponent = players.find(p => p.id !== user.id);
    const isUserLeft = user.id === players[0].id;

    // Set user info
    const userSide = isUserLeft ? 'left' : 'right';
    const opponentSide = isUserLeft ? 'right' : 'left';

    this.setPlayerInfo(userSide, user);
    if (opponent) this.setPlayerInfo(opponentSide, opponent);
  }

  private setPlayerInfo(side: 'left' | 'right', player: User | IPlayer): void {
    const nameElement = document.getElementById(`${side}_name`);
    const picElement = document.getElementById(
      `${side}_pic`,
    ) as HTMLImageElement;

    if (nameElement) nameElement.textContent = player.username;
    if (picElement) picElement.src = player.avatar || unknow_avatar;
  }

  public initializeCanvas(): HTMLCanvasElement {
    const canvas = document.getElementById('pong') as HTMLCanvasElement;
    if (!canvas) {
      throw new Error('Could not find canvas element');
    }
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Could not get canvas context');
    }

    // Get container dimensions
    const container = canvas.parentElement;
    if (!container) throw new Error('container not found');

    canvas.width = 1920;
    canvas.height = 1080;
    ctx.imageSmoothingEnabled = true;

    return canvas;
  }
}
