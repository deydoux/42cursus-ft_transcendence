import {BaseComponent} from '../../components/BaseComponent';
import {DOMUtils} from '../../utils/dom';
import {StatisticsData} from '../../types/game';
import {StatsCanvas} from './statisticsCanvas';

export class StatisticsUI extends BaseComponent {
  private decorativeCanvas: StatsCanvas | null = null;
  private statisticsData: StatisticsData | null = null;
  private currentView: 'overview' | 'pong' | 'race' = 'overview';

  render(): HTMLElement {
    const container = DOMUtils.createElement('div', {
      className: 'h-full flex-1 flex flex-col gap-4 max-w-full',
    });

    container.classList.add('statistics-ui');
    container.innerHTML = this.createContent();

    this.applyStyles();
    this.setupEventListeners(container);

    return container;
  }

  private createContent(): string {
    return `
    <div class="w-full h-full">
      <div class="flex w-full min-h-screen gap-8 p-8">
        <!-- Left Bandroll Canvas -->
        <div class="flex-none w-36 flex items-center justify-center">
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
          <div class="flex justify-center gap-4 mb-8">
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
                <div class="bg-black/70 border-2 border-pink-400 rounded-xl p-8 text-center min-w-96 max-w-2xl w-full bg-gradient-to-br from-pink-400/10 to-black/70">
                  <h3 class="text-2xl mb-8 drop-shadow-lg text-pink-400">🏓 Pong Statistics</h3>
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
                      <span class="text-gray-300">Best Streak:</span>
                      <span class="text-white font-bold" id="pong-streak">0</span>
                    </div>
                    <div class="flex justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                      <span class="text-gray-300">Total Points:</span>
                      <span class="text-white font-bold" id="pong-points">0</span>
                    </div>
                    <div class="flex justify-between p-3 bg-white/5 rounded-lg border border-white/10 col-span-2">
                      <span class="text-gray-300">Avg Game Duration:</span>
                      <span class="text-white font-bold" id="pong-avg-duration">0:00</span>
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
                  <div class="grid grid-cols-2 gap-4">
                    <div class="flex justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                      <span class="text-gray-300">Races Finished:</span>
                      <span class="text-white font-bold" id="race-finished">0</span>
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
                      <span class="text-gray-300">Best Time:</span>
                      <span class="text-white font-bold" id="race-best-time">--:--</span>
                    </div>
                    <div class="flex justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                      <span class="text-gray-300">Average Time:</span>
                      <span class="text-white font-bold" id="race-avg-time">--:--</span>
                    </div>
                    <div class="flex justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                      <span class="text-gray-300">Crashes:</span>
                      <span class="text-white font-bold" id="race-crashes">0</span>
                    </div>
                    <div class="flex justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                      <span class="text-gray-300">Checkpoints Hit:</span>
                      <span class="text-white font-bold" id="race-checkpoints">0</span>
                    </div>
                    <div class="flex justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                      <span class="text-gray-300">Total Distance:</span>
                      <span class="text-white font-bold" id="race-distance">0m</span>
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
  `;
    document.head.appendChild(style);
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
    this.updateElement(container, '#current-level', data.level.toString());
    this.updateElement(
      container,
      '#playtime-value',
      `${Math.floor(data.totalPlaytime / 3600)}h`,
    );

    // Update level progress
    this.updateElement(container, '#level-display', data.level.toString());
    const nextLevelXP = data.level * 1000;
    const currentXP = data.experience % 1000;
    this.updateElement(
      container,
      '#xp-progress',
      `${currentXP} / ${nextLevelXP} XP`,
    );

    const progressBar = container.querySelector('#xp-bar') as HTMLElement;
    if (progressBar) {
      const progress = (currentXP / nextLevelXP) * 100;
      progressBar.style.width = `${progress}%`;
    }

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
      '#pong-streak',
      data.pongStats.bestStreak.toString(),
    );
    this.updateElement(
      container,
      '#pong-points',
      data.pongStats.totalPoints.toString(),
    );
    this.updateElement(
      container,
      '#pong-avg-duration',
      this.formatTime(data.pongStats.averageGameDuration),
    );

    // Update race stats
    this.updateElement(
      container,
      '#race-finished',
      data.raceStats.racesFinished.toString(),
    );
    this.updateElement(container, '#race-wins', data.raceStats.wins.toString());
    this.updateElement(
      container,
      '#race-losses',
      data.raceStats.losses.toString(),
    );
    this.updateElement(
      container,
      '#race-best-time',
      this.formatTime(data.raceStats.bestTime),
    );
    this.updateElement(
      container,
      '#race-avg-time',
      this.formatTime(data.raceStats.averageTime),
    );
    this.updateElement(
      container,
      '#race-crashes',
      data.raceStats.crashes.toString(),
    );
    this.updateElement(
      container,
      '#race-checkpoints',
      data.raceStats.checkpointsHit.toString(),
    );
    this.updateElement(
      container,
      '#race-distance',
      `${Math.floor(data.raceStats.totalDistance)}m`,
    );
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

  private formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  private refreshStats(): void {
    // Emit event to request fresh statistics data
    console.log('Refreshing stats...');
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
