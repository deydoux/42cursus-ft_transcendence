import {BaseComponent} from '../../components/BaseComponent';
import {DOMUtils} from '../../utils/dom';
import {StatisticsData} from '../../types/statistics';
import {StatsCanvas} from './statisticsCanvas';

export class StatisticsUI extends BaseComponent {
  private decorativeCanvas: StatsCanvas | null = null;
  private statisticsData: StatisticsData | null = null;
  private currentView: 'overview' | 'pong' | 'race' = 'overview';

  render(): HTMLElement {
    const container = DOMUtils.createElement('div', {
      className: 'h-full flex-1 flex items-center gap-4 max-w-full',
    });

    container.classList.add('statistics-ui');
    container.innerHTML = this.createContent();

    this.applyStyles();
    this.setupEventListeners(container);

    return container;
  }

  private createContent(): string {
    return `
      <div class="flex w-full">
        <!-- Left Bandroll Canvas -->
        <div class="flex-none w-36 flex items-center h-full justify-center">
          <canvas
            id="pong-bandroll"
            class="w-30 h-4/5 rounded-full border-4 border-pink-400 bg-gradient-to-b from-pink-400/10 via-pink-400/5 to-pink-400/10 shadow-lg shadow-pink-400/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-pink-500/70"
          ></canvas>
        </div>
        
        <!-- Center Statistics Content -->
        <div class="flex-1 flex flex-col items-center max-w-6xl mx-auto px-8">
          <h1 class="text-5xl font-bold text-center bg-clip-text text-shadow-pink-300 text-shadow-lg/50 text-gray-300 mb-8">
            Game's Statistics
          </h1>
          
          <!-- Stats Navigation -->
          <div class="flex justify-center gap-4 mb-6">
            <button class="nav-btn px-6 py-3 bg-black/50 border-2 border-gray-600 text-white cursor-pointer transition-all duration-300 rounded-full font-bold uppercase tracking-wide hover:bg-white/10 hover:border-pink-400 hover:-translate-y-1 data-[active]:bg-gradient-to-r data-[active]:from-pink-400 data-[active]:to-pink-600 data-[active]:border-pink-400 data-[active]:shadow-lg data-[active]:shadow-pink-400/50" data-view="overview">
              Overview
            </button>
            <button class="nav-btn px-6 py-3 bg-black/50 border-2 border-gray-600 text-white cursor-pointer transition-all duration-300 rounded-full font-bold uppercase tracking-wide hover:bg-white/10 hover:border-pink-400 hover:-translate-y-1" data-view="pong">
              🏓 Pong
            </button>
            <button class="nav-btn px-6 py-3 bg-black/50 border-2 border-gray-600 text-white cursor-pointer transition-all duration-300 rounded-full font-bold uppercase tracking-wide hover:bg-white/10 hover:border-pink-400 hover:-translate-y-1" data-view="race">
              🏁 Race
            </button>
          </div>
          
          <!-- Main Statistics Content -->
          <div class="w-full">
            <!-- Overview Stats -->
            <div id="overview-stats" class="stats-section w-full">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8 max-w-4xl mx-auto">
                <div class="stat-card bg-black/70 border-2 border-gray-600 rounded-xl p-6 text-center transition-all duration-300 relative overflow-hidden group hover:-translate-y-2 hover:border-red-400 hover:shadow-lg hover:shadow-red-400/50 text-red-400">
                  <div class="text-4xl font-bold mb-2 drop-shadow-lg" id="total-games">0</div>
                  <div class="text-sm text-gray-300 uppercase tracking-wide">Total Games</div>
                  <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-600"></div>
                </div>
                
                <div class="stat-card bg-black/70 border-2 border-gray-600 rounded-xl p-6 text-center transition-all duration-300 relative overflow-hidden group hover:-translate-y-2 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-400/50 text-blue-400">
                  <div class="text-4xl font-bold mb-2 drop-shadow-lg" id="total-wins">0</div>
                  <div class="text-sm text-gray-300 uppercase tracking-wide">Total Wins</div>
                  <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-600"></div>
                </div>
                
                <div class="stat-card bg-black/70 border-2 border-gray-600 rounded-xl p-6 text-center transition-all duration-300 relative overflow-hidden group hover:-translate-y-2 hover:border-green-400 hover:shadow-lg hover:shadow-green-400/50 text-green-400">
                  <div class="text-4xl font-bold mb-2 drop-shadow-lg" id="win-rate">0%</div>
                  <div class="text-sm text-gray-300 uppercase tracking-wide">Win Rate</div>
                  <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-600"></div>
                </div>
                
                <div class="stat-card bg-black/70 border-2 border-gray-600 rounded-xl p-6 text-center transition-all duration-300 relative overflow-hidden group hover:-translate-y-2 hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-400/50 text-yellow-400">
                  <div class="text-4xl font-bold mb-2 drop-shadow-lg" id="total-losses">0</div>
                  <div class="text-sm text-gray-300 uppercase tracking-wide">Total Losses</div>
                  <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-600"></div>
                </div>
              </div>
            </div>
            
            <!-- Pong Stats -->
            <div id="pong-stats" class="stats-section hidden w-full">
              <div class="flex justify-center w-full">
                <div class="bg-black/70 border-2 border-pink-400 rounded-xl p-4 text-center min-w-96 max-w-2xl w-full bg-gradient-to-br from-pink-400/10 to-black/70">
                  <h3 class="text-2xl m-2 drop-shadow-lg text-pink-400">🏓 Pong Statistics</h3>
                  
                  <!-- Toggle Button -->
                  <div class="flex justify-center mb-4">
                    <div class="bg-white/10 rounded-full border border-white/20">
                    <button id="pong-toggle-stat" class="pong-toggle-btn px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 text-gray-300 hover:text-white">
                        <svg class="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><defs><style>.a,.b{fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.5px;}.a{fill-rule:evenodd;}</style></defs>
                        <path class="a" d="M3,16V15a9,9,0,0,1,9-9h0a9,9,0,0,1,9,9v1"></path><circle class="b" cx="12" cy="16" r="2"></circle><line class="b" x1="13.41089" x2="16.5" y1="14.58911" y2="11.5"></line></g>
                        </svg>
                      </button>  
                    <button id="pong-toggle-elo" class="pong-toggle-btn active px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 bg-pink-400 text-white">
                        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> 
                        <path d="M21 21H7.8C6.11984 21 5.27976 21 4.63803 20.673C4.07354 20.3854 3.6146 19.9265 3.32698 19.362C3 18.7202 3 17.8802 3 16.2V3M6 15L10 11L14 15L20 9M20 9V13M20 9H16" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g>
                        </svg>
                      </button>
                      <button id="pong-toggle-history" class="pong-toggle-btn px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 text-gray-300 hover:text-white">
                        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> 
                        <path d="M12 8V12L14.5 14.5" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> 
                        <path d="M5.60423 5.60423L5.0739 5.0739V5.0739L5.60423 5.60423ZM4.33785 6.87061L3.58786 6.87438C3.58992 7.28564 3.92281 7.61853 4.33408 7.6206L4.33785 6.87061ZM6.87963 7.63339C7.29384 7.63547 7.63131 7.30138 7.63339 6.88717C7.63547 6.47296 7.30138 6.13549 6.88717 6.13341L6.87963 7.63339ZM5.07505 4.32129C5.07296 3.90708 4.7355 3.57298 4.32129 3.57506C3.90708 3.57715 3.57298 3.91462 3.57507 4.32882L5.07505 4.32129ZM3.75 12C3.75 11.5858 3.41421 11.25 3 11.25C2.58579 11.25 2.25 11.5858 2.25 12H3.75ZM16.8755 20.4452C17.2341 20.2378 17.3566 19.779 17.1492 19.4204C16.9418 19.0619 16.483 18.9393 16.1245 19.1468L16.8755 20.4452ZM19.1468 16.1245C18.9393 16.483 19.0619 16.9418 19.4204 17.1492C19.779 17.3566 20.2378 17.2341 20.4452 16.8755L19.1468 16.1245ZM5.14033 5.07126C4.84598 5.36269 4.84361 5.83756 5.13505 6.13191C5.42648 6.42626 5.90134 6.42862 6.19569 6.13719L5.14033 5.07126ZM18.8623 5.13786C15.0421 1.31766 8.86882 1.27898 5.0739 5.0739L6.13456 6.13456C9.33366 2.93545 14.5572 2.95404 17.8017 6.19852L18.8623 5.13786ZM5.0739 5.0739L3.80752 6.34028L4.86818 7.40094L6.13456 6.13456L5.0739 5.0739ZM4.33408 7.6206L6.87963 7.63339L6.88717 6.13341L4.34162 6.12062L4.33408 7.6206ZM5.08784 6.86684L5.07505 4.32129L3.57507 4.32882L3.58786 6.87438L5.08784 6.86684ZM12 3.75C16.5563 3.75 20.25 7.44365 20.25 12H21.75C21.75 6.61522 17.3848 2.25 12 2.25V3.75ZM12 20.25C7.44365 20.25 3.75 16.5563 3.75 12H2.25C2.25 17.3848 6.61522 21.75 12 21.75V20.25ZM16.1245 19.1468C14.9118 19.8483 13.5039 20.25 12 20.25V21.75C13.7747 21.75 15.4407 21.2752 16.8755 20.4452L16.1245 19.1468ZM20.25 12C20.25 13.5039 19.8483 14.9118 19.1468 16.1245L20.4452 16.8755C21.2752 15.4407 21.75 13.7747 21.75 12H20.25ZM6.19569 6.13719C7.68707 4.66059 9.73646 3.75 12 3.75V2.25C9.32542 2.25 6.90113 3.32791 5.14033 5.07126L6.19569 6.13719Z" fill="#000000"></path> </g>
                        </svg>
                      </button>
                    </div>
                  </div>

                  <!-- Current ELO Display -->
                  <div class="mb-4 p-4 bg-white/5 rounded-lg border border-white/10">
                    <div class="text-lg text-gray-300">Current ELO</div>
                    <div class="text-3xl font-bold text-pink-400" id="pong-current-elo">--</div>
                  </div>
                  
                  <!-- ELO Chart -->
                  <div id="pong-elo-section" class="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
                    <h4 class="text-lg text-gray-300 mb-4">ELO Evolution</h4>
                    <canvas id="pong-elo-chart" class="w-full" height="100"></canvas>
                  </div>

                  <!-- Match History -->
                  <div id="pong-history-section" class="mb-6 p-4 bg-white/5 rounded-lg border border-white/10 hidden">
                    <h4 class="text-lg text-gray-300 mb-4">Recent Matches</h4>
                    <div id="pong-match-list" class="space-y-2 max-h-50 overflow-y-auto">
                      <!-- Match history will be populated here -->
                    </div>
                  </div>

                  <!-- Match Stat -->
                  <div id="pong-stat-section" class="mb-6 p-4 bg-white/5 rounded-lg border border-white/10 hidden">
                    <h4 class="text-lg text-gray-300 mb-4">Game Statistics</h4>
                    <div id="pong-match-list" class="space-y-2 h-50 overflow-y-auto">
                      <div class="grid grid-cols-2 gap-4">
                        <div class="flex justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                          <span class="text-gray-300">Games Played:</span>
                          <span class="text-white font-bold" id="pong-games">0</span>
                        </div>
                        <div class="flex justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                          <span class="text-gray-300">Wins:</span>
                          <span class="text-white font-bold" id="pong-wins">0</span>
                        </div>
                        <div class="flex justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                          <span class="text-gray-300">Losses:</span>
                          <span class="text-white font-bold" id="pong-losses">0</span>
                        </div>
                        <div class="flex justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                          <span class="text-gray-300">Win Rate:</span>
                          <span class="text-white font-bold" id="pong-winrate">0%</span>
                        </div>
                        <div class="flex justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                          <span class="text-gray-300">Current Streak:</span>
                          <span class="text-white font-bold" id="pong-current-streak">0</span>
                        </div>
                        <div class="flex justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                          <span class="text-gray-300">Best Streak:</span>
                          <span class="text-white font-bold" id="pong-best-streak">0:00</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  
                </div>
              </div>
            </div>
            
            <!-- Race Stats -->
            <div id="race-stats" class="stats-section hidden w-full">
              <div class="flex justify-center w-full">
                <div class="bg-black/70 border-2 border-green-400 rounded-xl p-8 text-center min-w-96 max-w-2xl w-full bg-gradient-to-br from-green-400/10 to-black/70">
                  <h3 class="text-2xl mb-8 drop-shadow-lg text-green-400">🏁 Race Statistics</h3>
                  <!-- Current ELO Display -->
                  <div class="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
                    <div class="text-lg text-gray-300">Current ELO</div>
                    <div class="text-3xl font-bold text-green-400" id="race-current-elo">--</div>
                  </div>
                  
                  <!-- ELO Chart -->
                  <div class="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
                    <h4 class="text-lg text-gray-300 mb-4">ELO Evolution</h4>
                    <canvas id="race-elo-chart" class="w-full" height="100"></canvas>
                  </div>
                  <div class="grid grid-cols-2 gap-4">
                  <div class="flex justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                      <span class="text-gray-300">Games Played:</span>
                      <span class="text-white font-bold" id="race-games">0</span>
                    </div>
                    <div class="flex justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                      <span class="text-gray-300">Wins:</span>
                      <span class="text-white font-bold" id="race-wins">0</span>
                    </div>
                    <div class="flex justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                      <span class="text-gray-300">Losses:</span>
                      <span class="text-white font-bold" id="race-losses">0</span>
                    </div>
                    <div class="flex justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                      <span class="text-gray-300">Win Rate:</span>
                      <span class="text-white font-bold" id="race-winrate">0</span>
                    </div>
                    <div class="flex justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                      <span class="text-gray-300">Current Streak:</span>
                      <span class="text-white font-bold" id="race-current-streak">0</span>
                    </div>
                    <div class="flex justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                      <span class="text-gray-300">Best Streak:</span>
                      <span class="text-white font-bold" id="race-best-streak">0</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Footer Controls -->
          <div class="text-center mt-8">
            <button class="cursor-pointer bg-gray-500 hover:bg-grey-600 text-white px-6 py-4 rounded-lg transition-colors flex items-center gap-2" id="refresh-stats">
            <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> 
            <path d="M15.9775 8.71452L15.5355 8.2621C13.5829 6.26318 10.4171 6.26318 8.46447 8.2621C6.51184 10.261 6.51184 13.5019 8.46447 15.5008C10.4171 17.4997 13.5829 17.4997 15.5355 15.5008C16.671 14.3384 17.1462 12.7559 16.9611 11.242M15.9775 8.71452H13.3258M15.9775 8.71452V6" stroke="#fda5d5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> 
            <path d="M22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C21.5093 4.43821 21.8356 5.80655 21.9449 8" stroke="#fda5d5" stroke-width="2" stroke-linecap="round"></path> </g>
            </svg>  
            Refresh Stats
            </button>
          </div>
        </div>
        
        <!-- Right Bandroll Canvas -->
        <div class="flex-none w-36 flex items-center justify-center">
          <canvas
            id="race-bandroll"
            class="w-30 h-4/5 rounded-full border-4 border-pink-400 bg-gradient-to-b from-pink-400/30 via-pink-400/10 to-pink-400/30 shadow-lg shadow-pink-400/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-pink-500/70"
          ></canvas>
        </div>
      </div>
  `;
  }

  private setupEventListeners(container: HTMLElement): void {
    // Initialize decorative canvases
    this.initializeDecorativeCanvases(container);

    // Navigation buttons
    const navButtons = container.querySelectorAll('.nav-btn');
    navButtons.forEach(button => {
      button.addEventListener('click', () => {
        const view = (button as HTMLElement).dataset.view as
          | 'overview'
          | 'pong'
          | 'race';
        this.switchView(view, container);
        this.updateActiveNavButton(button as HTMLElement, container);
      });
    });

    // Refresh stats
    const refreshButton = container.querySelector('#refresh-stats');
    refreshButton?.addEventListener('click', () => {
      this.refreshStats();
    });

    // Pong toggle buttons

    const pongToggleElo = container.querySelector('#pong-toggle-elo');
    const pongToggleHistory = container.querySelector('#pong-toggle-history');
    const pongToggleStat = container.querySelector('#pong-toggle-stat');

    pongToggleElo?.addEventListener('click', () => {
      this.togglePongView('elo', container);
    });

    pongToggleHistory?.addEventListener('click', () => {
      this.togglePongView('history', container);
    });

    pongToggleStat?.addEventListener('click', () => {
      this.togglePongView('stat', container);
    });
  }

  private applyStyles(): void {
    const style = document.createElement('style');
    style.textContent = `
    /* Custom animations and effects that Tailwind doesn't cover */
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    
    .stats-section {
      animation: fadeIn 0.5s ease;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    /* Active nav button state */
    .nav-btn[data-active="true"] {
      @apply bg-gradient-to-r from-pink-400 to-pink-600 border-pink-400 shadow-lg shadow-pink-400/50;
    }

    /* Toggle button styles */
    .pong-toggle-btn {
      transition: all 0.3s ease;
    }
    
    .pong-toggle-btn:hover {
      background-color: rgba(244, 114, 182, 0.5);
    }
    
    .pong-toggle-btn.active {
      background-color: rgb(244, 114, 182);
      color: white;
    }
  `;
    document.head.appendChild(style);
  }

  private togglePongView(
    view: 'elo' | 'history' | 'stat',
    container: HTMLElement,
  ): void {
    const eloSection = container.querySelector('#pong-elo-section');
    const statSection = container.querySelector('#pong-stat-section');
    const historySection = container.querySelector('#pong-history-section');
    const eloBtn = container.querySelector('#pong-toggle-elo');
    const statBtn = container.querySelector('#pong-toggle-stat');
    const historyBtn = container.querySelector('#pong-toggle-history');

    if (view === 'elo') {
      eloSection?.classList.remove('hidden');
      statSection?.classList.add('hidden');
      historySection?.classList.add('hidden');

      // Update button styles
      eloBtn?.classList.add('active', 'bg-pink-400', 'text-white');
      eloBtn?.classList.remove('text-gray-300');
      historyBtn?.classList.remove('active', 'bg-pink-400', 'text-white');
      historyBtn?.classList.add('text-gray-300');
      statBtn?.classList.remove('active', 'bg-pink-400', 'text-white');
      statBtn?.classList.add('text-gray-300');
    } else if (view === 'history') {
      eloSection?.classList.add('hidden');
      statSection?.classList.add('hidden');
      historySection?.classList.remove('hidden');

      // Update button styles
      historyBtn?.classList.add('active', 'bg-pink-400', 'text-white');
      historyBtn?.classList.remove('text-gray-300');
      eloBtn?.classList.remove('active', 'bg-pink-400', 'text-white');
      eloBtn?.classList.add('text-gray-300');
      statBtn?.classList.remove('active', 'bg-pink-400', 'text-white');
      statBtn?.classList.add('text-gray-300');

      // Load match history if data is available
      if (this.statisticsData) {
        this.updateMatchHistory(container);
      }
    } else {
      eloSection?.classList.add('hidden');
      historySection?.classList.add('hidden');
      statSection?.classList.remove('hidden');

      statBtn?.classList.add('active', 'bg-pink-400', 'text-white');
      statBtn?.classList.remove('text-gray-300');
      historyBtn?.classList.remove('active', 'bg-pink-400', 'text-white');
      historyBtn?.classList.add('text-gray-300');
      eloBtn?.classList.remove('active', 'bg-pink-400', 'text-white');
      eloBtn?.classList.add('text-gray-300');
    }
  }

  private updateMatchHistory(container: HTMLElement): void {
    if (!this.statisticsData) return;

    const matchList = container.querySelector('#pong-match-list');
    if (!matchList) return;

    // You'll need to get match data from your statistics data
    // For now, I'll show a placeholder - you'll need to add match history to StatisticsData
    const matches = this.statisticsData.pongStats.matches || [];

    if (matches.length === 0) {
      matchList.innerHTML =
        '<div class="text-gray-400 text-center py-4">No recent matches</div>';
      return;
    }

    const {user} = this.store.getState();
    matchList.innerHTML = matches
      .slice(0, 10)
      .map(
        match => `
      <div class="flex justify-between items-center p-2 bg-white/5 rounded border border-white/10">
        <div class="flex items-center gap-2">
          <span class="text-sm ${match.winner.id === user?.id ? 'text-green-400' : 'text-red-400'}">
            ${match.winner.id === user?.id ? '✓' : '✗'}
          </span>
          <span class="text-white text-sm">played against ${match.winner.id === user?.id ? match.loser.username : match.winner.username}</span>
        </div>
        <div class="text-xs text-gray-400">
          ${match.winner.score} | ${match.loser.score} • ${new Date(match.createdAt).toLocaleDateString()}
        </div>
      </div>
    `,
      )
      .join('');
  }

  private initializeDecorativeCanvases(container: HTMLElement): void {
    const pongCanvas = container.querySelector(
      '#pong-bandroll',
    ) as HTMLCanvasElement;
    const raceCanvas = container.querySelector(
      '#race-bandroll',
    ) as HTMLCanvasElement;

    if (pongCanvas && raceCanvas) {
      // Set canvas sizes for vertical bandrolls
      const canvasWidth = 120;
      const canvasHeight = Math.floor(window.innerHeight * 0.8);

      pongCanvas.width = canvasWidth;
      pongCanvas.height = canvasHeight;
      raceCanvas.width = canvasWidth;
      raceCanvas.height = canvasHeight;

      // Set CSS size to match canvas size
      pongCanvas.style.width = `${canvasWidth}px`;
      pongCanvas.style.height = `${canvasHeight}px`;
      raceCanvas.style.width = `${canvasWidth}px`;
      raceCanvas.style.height = `${canvasHeight}px`;

      const pongCtx = pongCanvas.getContext('2d');
      const raceCtx = raceCanvas.getContext('2d');

      if (pongCtx && raceCtx) {
        // Enable smooth rendering
        pongCtx.imageSmoothingEnabled = true;
        raceCtx.imageSmoothingEnabled = true;

        this.decorativeCanvas = new StatsCanvas(raceCtx, pongCtx);
        this.decorativeCanvas.loop();
      }
    }
  }

  private switchView(
    view: 'overview' | 'pong' | 'race',
    container: HTMLElement,
  ): void {
    this.currentView = view;

    // Hide all sections
    const sections = container.querySelectorAll('.stats-section');
    sections.forEach(section => section.classList.add('hidden'));

    // Show selected section
    const targetSection = container.querySelector(`#${view}-stats`);
    if (targetSection) {
      targetSection.classList.remove('hidden');
    }

    // Update view-specific content
    if (this.statisticsData) {
      this.updateViewContent(container);
    }
  }

  private updateActiveNavButton(
    activeButton: HTMLElement,
    container: HTMLElement,
  ): void {
    const navButtons = container.querySelectorAll('.nav-btn');
    navButtons.forEach(btn => {
      btn.removeAttribute('data-active');
      btn.classList.remove(
        'bg-gradient-to-r',
        'from-pink-400',
        'to-pink-600',
        'border-pink-400',
        'shadow-lg',
        'shadow-pink-400/50',
      );
    });

    activeButton.setAttribute('data-active', 'true');
    activeButton.classList.add(
      'bg-gradient-to-r',
      'from-pink-400',
      'to-pink-600',
      'border-pink-400',
      'shadow-lg',
      'shadow-pink-400/50',
    );
  }

  private updateViewContent(container: HTMLElement): void {
    if (!this.statisticsData) return;

    const data = this.statisticsData;

    // Update overview stats
    this.updateElement(
      container,
      '#total-games',
      data.totalGamesPlayed.toString(),
    );
    this.updateElement(container, '#total-wins', data.totalWins.toString());
    this.updateElement(container, '#total-losses', data.totalLosses.toString());
    this.updateElement(container, '#win-rate', `${data.winRate.toFixed(1)}%`);

    // Update pong stats
    this.updateElement(
      container,
      '#pong-games',
      data.pongStats.gamesPlayed.toString(),
    );
    this.updateElement(container, '#pong-wins', data.pongStats.wins.toString());
    this.updateElement(
      container,
      '#pong-losses',
      data.pongStats.losses.toString(),
    );
    this.updateElement(
      container,
      '#pong-winrate',
      `${data.pongStats.winRate.toFixed(1)}%`,
    );
    this.updateElement(
      container,
      '#pong-best-streak',
      data.pongStats.bestStreak.toString(),
    );
    this.updateElement(
      container,
      '#pong-current-streak',
      data.pongStats.currentStreak.toString(),
    );
    this.updateElement(
      container,
      '#pong-current-elo',
      data.pongStats.currentElo?.toString() || '--',
    );
    this.drawEloChart('pong-elo-chart', data.pongStats.eloHistory, '#ff4444');

    // Update race stats
    this.updateElement(container, '#race-wins', data.raceStats.wins.toString());
    this.updateElement(
      container,
      '#race-losses',
      data.raceStats.losses.toString(),
    );
    this.updateElement(
      container,
      '#race-winrate',
      `${data.raceStats.winRate.toFixed(1)}%`,
    );
    this.updateElement(
      container,
      '#race-best-streak',
      data.raceStats.bestStreak.toString(),
    );
    this.updateElement(
      container,
      '#race-current-streak',
      data.raceStats.currentStreak.toString(),
    );
    this.updateElement(
      container,
      '#race-current-elo',
      data.raceStats.currentElo?.toString() || '--',
    );
    this.drawEloChart('race-elo-chart', data.raceStats.eloHistory, '#44ff44');
  }

  private updateElement(
    container: HTMLElement,
    selector: string,
    value: string,
  ): void {
    const element = container.querySelector(selector);
    if (element) {
      element.textContent = value;
    }
  }

  private drawEloChart(
    canvasId: string,
    eloHistory: {value: number; createdAt: string}[],
    color: string,
  ): void {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas || !eloHistory.length) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 200;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Chart settings
    const padding = 40;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;

    // Find min and max ELO
    const eloValues = eloHistory.map(entry => entry.value);
    const minElo = Math.min(...eloValues) - 50;
    const maxElo = Math.max(...eloValues) + 50;
    const eloRange = maxElo - minElo;

    // Draw grid lines and labels
    ctx.strokeStyle = '#444';
    ctx.lineWidth = 1;
    ctx.font = '12px Arial';
    ctx.fillStyle = '#888';

    // Horizontal grid lines (ELO values)
    for (let i = 0; i <= 5; i++) {
      const y = padding + (chartHeight / 5) * i;
      const eloValue = maxElo - (eloRange / 5) * i;

      ctx.beginPath();
      ctx.moveTo(padding, y);
      ctx.lineTo(padding + chartWidth, y);
      ctx.stroke();

      ctx.fillText(Math.round(eloValue).toString(), 5, y + 4);
    }

    // Draw ELO line
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();

    eloHistory.forEach((entry, index) => {
      const x = padding + (chartWidth / (eloHistory.length - 1)) * index;
      const y =
        padding +
        chartHeight -
        ((entry.value - minElo) / eloRange) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw ELO points
    ctx.fillStyle = color;
    eloHistory.forEach((entry, index) => {
      const x = padding + (chartWidth / (eloHistory.length - 1)) * index;
      const y =
        padding +
        chartHeight -
        ((entry.value - minElo) / eloRange) * chartHeight;

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  private refreshStats(): void {
    const refreshEvent = new CustomEvent('refreshStatistics');
    document.dispatchEvent(refreshEvent);
  }

  public updateStatistics(data: StatisticsData): void {
    this.statisticsData = data;
    const container = document.querySelector('.statistics-ui');
    if (container) {
      this.updateViewContent(container as HTMLElement);
    }
  }

  public show(): void {
    const container = document.querySelector('.statistics-ui') as HTMLElement;
    if (container) {
      container.style.display = 'block';
      this.refreshStats();
    }
  }

  public hide(): void {
    const container = document.querySelector('.statistics-ui') as HTMLElement;
    if (container) {
      container.style.display = 'none';
    }
    if (this.decorativeCanvas?.raf) {
      cancelAnimationFrame(this.decorativeCanvas.raf);
    }
  }
}
