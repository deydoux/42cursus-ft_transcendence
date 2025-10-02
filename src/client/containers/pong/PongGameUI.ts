import {BaseComponent} from '../../components/BaseComponent';
import {DOMUtils} from '../../utils/dom';
import {Router} from '../../services/router';
import {User} from '../../handlers/game';

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
      className:
        'flex justify-between items-center px-8 py-4 bg-gray-600 rounded-lg',
    });

    // Left player info
    const leftPlayer = DOMUtils.createElement('div', {
      className: 'flex items-center gap-4',
    });
    leftPlayer.innerHTML = `
      <img id="left_pic" class="w-16 h-16 rounded-full border-2 border-blue-500" src="" alt="Player">
      <div>
        <div id="left_name" class="text-xl font-bold text-white"></div>
      </div>
    `;

    // Score display
    const scoreDisplay = DOMUtils.createElement('div', {
      className: 'flex items-center gap-8 text-4xl font-bold text-white',
    });
    scoreDisplay.innerHTML = `
      <span id="left_score">0</span>
      <span class="text-gray-500">-</span>
      <span id="right_score">0</span>
    `;

    // Right player info
    const rightPlayer = DOMUtils.createElement('div', {
      className: 'flex items-center gap-4 flex-row-reverse',
    });
    rightPlayer.innerHTML = `
      <img id="right_pic" class="w-16 h-16 rounded-full border-2 border-red-500" src="" alt="Player">
      <div class="text-right">
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
      className:
        'flex-1 flex justify-center items-center bg-black rounded-lg overflow-hidden bg-linear-to-br from-pink-200 to-pink-300 shadow-lg shadow-pink-300/30',
    });

    const canvas = DOMUtils.createElement('canvas', {
      attributes: {id: 'pong'},
      className: 'max-w-full max-h-full',
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
    const {players, user} = this.store.getState();
    if (!players || !user || !this.gameEndModal) return;

    // Hide canvas
    const canvas = document.getElementById('pong');
    if (canvas) canvas.style.display = 'none';

    const isWinner = data.winner === user.id;
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
               src="${user.avatar || '/default-avatar.png'}" alt="${user.username}">
          <div class="font-bold text-white">${user.username}</div>
          <div class="text-sm text-gray-600">ELO: ${user.elo}</div>
          ${
            data.eloChange
              ? `<div class="text-sm ${isWinner ? 'text-green-400' : 'text-red-400'}">
            ${isWinner ? '+' : ''}${data.eloChange}
          </div>`
              : ''
          }
        </div>
        
        <div class="text-4xl font-bold text-white">
          ${userScore} - ${opponentScore}
        </div>
        
        <div class="flex flex-col items-center">
          <img class="w-20 h-20 rounded-full mb-2 border-2 ${!isWinner ? 'border-green-400' : 'border-red-400'}" 
               src="${opponent?.avatar || '/default-avatar.png'}" alt="${opponent?.username || 'Opponent'}">
          <div class="font-bold text-white">${opponent?.username || 'Opponent'}</div>
          <div class="text-sm text-gray-600">ELO: ${opponent?.elo || 'N/A'}</div>
        </div>
      </div>
      
      ${data.result ? `<div class="mb-6 text-gray-300">${data.result}</div>` : ''}
      
      <div class="flex gap-4 justify-center">
        <button id="close-modal-btn" class="bg-grey-300 hover:bg-grey-400 text-white px-6 py-2 rounded-lg transition-colors">
          Back to Lobby
        </button>
        <button id="rematch-btn" class="bg-grey-300 hover:bg-grey-400 text-white px-6 py-2 rounded-lg transition-colors">
          Rematch
        </button>
      </div>
    `; //TODO: show rematch btn only if game local

    // Show modal
    this.gameEndModal.classList.remove('hidden');

    // Add event listeners
    this.setupModalEventListeners();
  }

  private setupModalEventListeners(): void {
    if (!this.gameEndModal) return;

    const closeBtn = this.gameEndModal.querySelector('#close-modal-btn');
    const rematchBtn = this.gameEndModal.querySelector('#rematch-btn');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeModal();
        this.router.navigate('/lobby');
      });
    }

    if (rematchBtn) {
      rematchBtn.addEventListener('click', () => {
        // Handle rematch logic here
        this.closeModal();
        // You could emit a rematch request to the server
      });
    }

    // Close on backdrop click
    this.gameEndModal.addEventListener('click', e => {
      if (e.target === this.gameEndModal) {
        this.closeModal();
        this.router.navigate('/lobby');
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
  }

  public initializePlayerInfo(): void {
    const {players, user} = this.store.getState();
    if (!players || !user) return;

    const opponent = players.find(p => p.id !== user.id);
    const isUserLeft = user.id === players[0].id;

    // Set user info
    const userSide = isUserLeft ? 'left' : 'right';
    const opponentSide = isUserLeft ? 'right' : 'left';

    this.setPlayerInfo(userSide, user);
    if (opponent) this.setPlayerInfo(opponentSide, opponent);
  }

  private setPlayerInfo(side: 'left' | 'right', player: User): void {
    const nameElement = document.getElementById(`${side}_name`);
    const picElement = document.getElementById(
      `${side}_pic`,
    ) as HTMLImageElement;

    if (nameElement) nameElement.textContent = player.username;
    if (picElement) picElement.src = player.avatar || '/default-avatar.png';
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

    canvas.width = 1920;
    canvas.height = 1080;
    ctx.imageSmoothingEnabled = true;

    return canvas;
  }
}
