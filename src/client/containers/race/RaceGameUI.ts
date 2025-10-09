import {BaseComponent} from '../../components/BaseComponent';
import {DOMUtils} from '../../utils/dom';
import {IPlayer} from '../../types/game';
import {RaceCanvas} from './raceCanvas';
import {Router} from '../../services/router';
import {User} from '../../handlers/game';
import unknow_avatar from '../../assets/unknown-avatar.jpeg';

interface RaceGameUIElement extends HTMLElement {
  showGameEndModal(data: {
    winner: number;
    result?: string;
    eloChange?: number;
  }): void;
}

export class RaceGameUI extends BaseComponent {
  private gameEndModal?: HTMLElement;
  protected router = Router.getInstance();

  render(): HTMLElement {
    const container = DOMUtils.createElement('div', {
      className: 'h-full flex-1 flex flex-col gap-4 max-w-full',
    }) as unknown as RaceGameUIElement;

    container.showGameEndModal = this.showGameEndModal.bind(this);
    container.classList.add('race-game-ui');

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
        'flex justify-between items-center px-8 py-4 bg-gray-600 rounded-lg mx-auto',
    });

    // Left player info
    const leftPlayer = DOMUtils.createElement('div', {
      className: 'flex items-center gap-4',
    });
    leftPlayer.innerHTML = `
      <img id="left_pic" class="w-16 h-16 rounded-full border-2 border-blue-500" src="" alt="Player">
      <div>
        <div id="left_name" class="text-xl font-bold text-white"></div>
        <div id="left_score" class="text-lg font-bold text-white">0</div>
      </div>
    `;

    const timeDisplay = DOMUtils.createElement('div', {
      className: 'flex flex-col items-center gap-2 text-white',
    });
    timeDisplay.innerHTML = `
      <div id="race_timer" class="text-3xl font-bold">00:00</div>
    `;

    // Right player info
    const rightPlayer = DOMUtils.createElement('div', {
      className: 'flex items-center gap-4 flex-row-reverse',
    });
    rightPlayer.innerHTML = `
      <img id="right_pic" class="w-16 h-16 rounded-full border-2 border-red-500" src="" alt="Player">
      <div class="text-right">
        <div id="right_name" class="text-xl font-bold text-white"></div>
        <div id="right_score" class="text-lg font-bold text-white">0</div>
      </div>
    `;

    header.appendChild(leftPlayer);
    header.appendChild(timeDisplay);
    header.appendChild(rightPlayer);

    return header;
  }

  private renderGameArea(): HTMLElement {
    const gameArea = DOMUtils.createElement('div', {
      className: 'flex-1 flex justify-center items-center overflow-hidden',
    });

    const canvas = DOMUtils.createElement('canvas', {
      attributes: {id: 'race'},
      className:
        'w-full h-auto bg-linear-to-br from-pink-500 to-pink-600 shadow-lg shadow-pink-500/30 rounded-lg',
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
        'bg-pink-500 rounded-lg p-8 max-w-xl w-full mx-4 text-center text-shadow-lg/30',
    });

    modal.appendChild(content);
    return modal;
  }

  public showGameEndModal(data: {
    winner: number;
    result?: string;
    eloChange?: number;
  }): void {
    const raceCanvas = RaceCanvas.getInstance();
    const {user} = this.store.getState();
    if (!user) throw new Error('user not found');

    let players;
    if (!raceCanvas.race.isLocal) {
      players = this.store.getState().players;
    } else {
      players = [raceCanvas.race.player, raceCanvas.race.opponent];
    }
    if (!players || !this.gameEndModal) return;

    // Hide canvas
    const canvas = document.getElementById('race');
    if (canvas) canvas.style.display = 'none';

    const isWinner = data.winner === user.id;
    const opponent = players.find(p => p.id !== user.id);

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
          ${isWinner ? '1st' : '2nd'} Place
        </div>
        
        <div class="flex flex-col items-center">
          <img class="w-20 h-20 rounded-full mb-2 border-2 ${!isWinner ? 'border-green-400' : 'border-red-400'}" 
               src="${opponent?.avatar || unknow_avatar}" alt="${opponent?.username || 'Opponent'}">
          <div class="font-bold text-white">${opponent?.username || 'Opponent'}</div>
          <div class="text-sm text-gray-600">ELO: ${opponent?.elo || 'N/A'}</div>
        </div>
      </div>
      
      ${data.result ? `<div class="mb-6 text-gray-300">${data.result}</div>` : ''}
      
      <div class="flex gap-4 justify-center">
        <button id="close-modal-btn" class="bg-gray-400 hover:bg-grey-500 text-white px-6 py-2 rounded-lg transition-colors">
          Home
        </button>
        <button id="rematch-btn" class="bg-gray-400 hover:bg-grey-500 text-white px-6 py-2 rounded-lg transition-colors">
          Rematch
        </button>
      </div>
    `;

    // Show modal
    this.gameEndModal.classList.remove('hidden');

    // Add event listeners
    this.setupModalEventListeners();
  }

  public initializePlayerInfo(): void {
    const raceCanvas = RaceCanvas.getInstance();
    const {user} = this.store.getState();
    if (!user) throw new Error('user not found');

    let players;
    if (!raceCanvas.race.isLocal) {
      players = this.store.getState().players;
    } else {
      players = [raceCanvas.race.player, raceCanvas.race.opponent];
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

  public updateRaceInfo(timer: string, lap: number, totalLaps: number): void {
    const timerElement = document.getElementById('race_timer');
    const lapElement = document.getElementById('lap_counter');

    if (timerElement) timerElement.textContent = timer;
    if (lapElement) lapElement.textContent = `Lap ${lap}/${totalLaps}`;
  }

  public updatePlayerPosition(side: 'left' | 'right', position: number): void {
    const positionElement = document.getElementById(`${side}_position`);
    if (positionElement) {
      positionElement.textContent = `Position: ${position}`;
    }
  }

  public initializeCanvas(): HTMLCanvasElement {
    const canvas = document.getElementById('race') as HTMLCanvasElement;
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
    const containerRect = container.getBoundingClientRect();

    // Calculate scale to fit container while maintaining aspect ratio
    const scaleX = containerRect.width / 1920;
    const scaleY = containerRect.height / 1080;
    const scale = Math.min(scaleX, scaleY);

    const canvasWidth = 1920 * scale;
    const canvasHeight = 1080 * scale;

    // Set canvas display size
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    // Set header width to match canvas
    const header = document.getElementById('game-header');
    if (header) {
      header.style.width = `${canvasWidth}px`;
    }

    canvas.width = 1920;
    canvas.height = 1080;
    ctx.imageSmoothingEnabled = true;

    return canvas;
  }

  private setupModalEventListeners(): void {
    if (!this.gameEndModal) return;

    const raceCanvas = RaceCanvas.getInstance();
    const closeBtn = this.gameEndModal.querySelector('#close-modal-btn');
    const rematchBtn = this.gameEndModal.querySelector('#rematch-btn');

    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.closeModal();
        this.router.navigate('/homepage');
      });
    }

    if (!raceCanvas.race.isLocal)
      (rematchBtn as HTMLElement).style.display = 'none';

    if (rematchBtn) {
      rematchBtn.addEventListener('click', () => {
        this.closeModal();
        this.router.navigate('/race');
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
    const canvas = document.getElementById('race');
    if (canvas) canvas.style.display = 'block';

    // Destroy the RaceCanvas instance when navigating away
    RaceCanvas.destroyInstance();
  }
}
