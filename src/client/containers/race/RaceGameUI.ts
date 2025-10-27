import {
  getCurrentGame,
  getRaceCanvasInstance,
  startWinnerCelebration,
} from '../../utils/content';
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
        'flex justify-between items-center px-8 py-4 bg-gray-600 rounded-lg mx-auto w-full',
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
      className:
        'flex-1 flex justify-center items-center border-4 border-pink-300 rounded-md',
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
        'bg-pink-300 rounded-lg p-8 max-w-xl w-full mx-4 text-center text-shadow-lg/30',
    });

    modal.appendChild(content);
    return modal;
  }

  public showGameEndModal(data: {
    winner: number;
    result?: string;
    eloChange?: number;
  }): void {
    const raceCanvas = getRaceCanvasInstance();
    const {user} = this.store.getState();
    if (!user) throw new Error('user not found');

    let players;
    if (!raceCanvas.race.isLocal) {
      players = this.store.getState().game.players;
    } else {
      players = [raceCanvas.race.player, raceCanvas.race.opponent];
    }
    if (!players || !this.gameEndModal) return;

    // Hide canvas
    const canvas = document.getElementById('race');
    if (canvas) canvas.style.display = 'none';

    const isWinner = data.winner === user.id;
    const isTie = data.result === 'tie' ? true : false;
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
  <!-- Victory/Defeat message centered at top -->
  <h2 class="text-4xl font-bold mb-8 text-center ${isTie ? 'text-gray-400' : isWinner ? 'text-green-400' : 'text-red-400'}">
    ${isTie ? 'Tie!' : isWinner ? 'Victory!' : 'Defeat!'}
  </h2>
  
  <!-- Player info with scores in the middle -->
  <div class="flex justify-between items-center mb-8">
    <div class="flex flex-col items-center">
      <img class="w-20 h-20 rounded-full mb-3 border-2 ${isTie ? 'border-gray-400' : isWinner ? 'border-green-400' : 'border-red-400'}" 
           src="${user.avatar || unknow_avatar}" alt="${user.username}">
      <div class="font-bold text-white text-lg">${user.username}</div>
      ${!raceCanvas.race.isLocal ? `<div class="text-sm text-black mb-2">ELO: ${user.elo}</div>` : ''}
      ${
        data.eloChange && !raceCanvas.race.isLocal
          ? `<div class="text-sm ${isTie ? 'text-gray-400' : isWinner ? 'text-green-400' : 'text-red-400'} font-bold">
        ${isTie ? '' : isWinner ? '+' : ''}${data.eloChange}
      </div>`
          : ''
      }
    </div>
    
    <!-- Scores in the center -->
    <div class="flex flex-col items-center">
      <div class="text-6xl font-bold text-white mb-2">
        ${userScore} - ${opponentScore}
      </div>
    </div>
    
    <div class="flex flex-col items-center">
      <img class="w-20 h-20 rounded-full mb-3 border-2 ${isTie ? 'border-gray-400' : !isWinner ? 'border-green-400' : 'border-red-400'}" 
           src="${opponent?.avatar || unknow_avatar}" alt="${opponent?.username || 'Opponent'}">
      <div class="font-bold text-white text-lg">${opponent?.username || 'Opponent'}</div>
      ${!raceCanvas.race.isLocal ? `<div class="text-sm text-black mb-2">ELO: '0'</div>` : ''}
    </div>
  </div>
  
  ${data.result ? `<div class="mb-6 text-gray-300 text-center">${data.result}</div>` : ''}
  
  <div class="flex gap-4 justify-center">
    <button id="close-modal-btn" class="cursor-pointer bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2">
      <svg class="w-5 h-5" fill="#fda5d5" viewBox="0 0 495.398 495.398">
        <path d="M487.083,225.514l-75.08-75.08V63.704c0-15.682-12.708-28.391-28.413-28.391c-15.669,0-28.377,12.709-28.377,28.391 v29.941L299.31,37.74c-27.639-27.624-75.694-27.575-103.27,0.05L8.312,225.514c-11.082,11.104-11.082,29.071,0,40.158 c11.087,11.101,29.089,11.101,40.172,0l187.71-187.729c6.115-6.083,16.893-6.083,22.976-0.018l187.742,187.747 c5.567,5.551,12.825,8.312,20.081,8.312c7.271,0,14.541-2.764,20.091-8.312C498.17,254.586,498.17,236.619,487.083,225.514z"/>
        <path d="M257.561,131.836c-5.454-5.451-14.285-5.451-19.723,0L72.712,296.913c-2.607,2.606-4.085,6.164-4.085,9.877v120.401 c0,28.253,22.908,51.16,51.16,51.16h81.754v-126.61h92.299v126.61h81.755c28.251,0,51.159-22.907,51.159-51.159V306.79 c0-3.713-1.465-7.271-4.085-9.877L257.561,131.836z"/>
      </svg>
      Home
    </button>
    <button id="rematch-btn" class="cursor-pointer bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors flex items-center gap-2">
      <svg class="w-8 h-8" version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <style type="text/css"> .st0{fill:#fda5d5;} </style> <g> 
      <path class="st0" d="M65.417,237.509c-28.796,0-52.142,23.346-52.142,52.149c0,28.804,23.346,52.149,52.142,52.149 c28.804,0,52.149-23.346,52.149-52.149C117.566,260.856,94.221,237.509,65.417,237.509z M65.417,317.156 c-15.176,0-27.49-12.298-27.49-27.498c0-15.191,12.314-27.49,27.49-27.49c15.2,0,27.498,12.299,27.498,27.49 C92.915,304.858,80.617,317.156,65.417,317.156z"></path> 
      <path class="st0" d="M65.417,281.121c-4.707,0-8.522,3.831-8.522,8.538c0,4.715,3.815,8.538,8.522,8.538 c4.715,0,8.546-3.823,8.546-8.538C73.963,284.952,70.132,281.121,65.417,281.121z"></path> <path class="st0" d="M393.738,229.965c-38.874-5.817-78.622-9.453-110.967-11.72c-2.291,10.148-9.75,19.264-19.186,19.264 c-11.376,0-51.203,0-51.203,0v-22.751v-44.566c-61.97,6.756-101.288,39.296-124.165,64.268 c21.658,8.976,36.942,30.336,36.942,55.198c0,5.583-0.79,10.977-2.228,16.122h214.946c-1.439-5.145-2.228-10.539-2.228-16.122 C335.647,257.275,361.557,230.84,393.738,229.965z"></path> <path class="st0" d="M65.417,229.926c1.9,0,3.768,0.102,5.614,0.266l10.508-14.496v-33.173H0v83.439l8.741,4.902 C16.646,247.111,39.061,229.926,65.417,229.926z"></path> 
      <path class="st0" d="M470.281,286.813v-9.476l18.021-9.476c0,0,3.331-11.04,3.331-18.624c-21.219-7.005-49.57-11.102-75.738-15.684 c22.862,8.397,39.217,30.375,39.217,56.105c0,5.583-0.79,10.977-2.236,16.122H512v-18.967H470.281z"></path> <path class="st0" d="M395.38,237.509c-28.796,0-52.15,23.346-52.15,52.149c0,28.804,23.354,52.149,52.15,52.149 c28.804,0,52.149-23.346,52.149-52.149C447.529,260.856,424.184,237.509,395.38,237.509z M395.38,317.156 c-15.192,0-27.498-12.298-27.498-27.498c0-15.191,12.306-27.49,27.498-27.49c15.184,0,27.498,12.299,27.498,27.49 C422.878,304.858,410.564,317.156,395.38,317.156z"></path> <path class="st0" d="M395.38,281.121c-4.715,0-8.538,3.831-8.538,8.538c0,4.715,3.823,8.538,8.538,8.538 c4.715,0,8.53-3.823,8.53-8.538C403.91,284.952,400.095,281.121,395.38,281.121z"></path> </g> </g>
      </svg>
      Rematch
    </button>
  </div>
`;

    // Show modal
    this.gameEndModal.classList.remove('hidden');

    // Start celebration only if user is the winner
    if (isWinner || isTie) startWinnerCelebration();

    // Add event listeners
    this.setupModalEventListeners();
  }

  public initializePlayerInfo(): void {
    const raceCanvas = getRaceCanvasInstance();
    const {user} = this.store.getState();
    if (!user) throw new Error('user not found');

    let players;
    if (!raceCanvas.race.isLocal) {
      players = this.store.getState().game.players;
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

    const raceCanvas = getRaceCanvasInstance();
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
        sessionStorage.setItem('validGameAccess', 'rematch');
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
    RaceCanvas.clearInstance(getCurrentGame().id.toString());
  }
}
