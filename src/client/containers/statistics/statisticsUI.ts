import {BaseComponent} from '../../components/BaseComponent';
import {DOMUtils} from '../../utils/dom';
import {StatsCanvas} from './statsCanvas';

interface StatisticsData {
  // General game stats
  totalGamesPlayed: number;
  totalWins: number;
  totalLosses: number;
  winRate: number;
  totalPlaytime: number;
  level: number;
  experience: number;

  // Pong-specific stats
  pongStats: {
    gamesPlayed: number;
    wins: number;
    losses: number;
    winRate: number;
    bestStreak: number;
    totalPoints: number;
    averageGameDuration: number;
  };

  // Race-specific stats
  raceStats: {
    racesFinished: number;
    wins: number;
    losses: number;
    bestTime: number;
    averageTime: number;
    crashes: number;
    checkpointsHit: number;
    totalDistance: number;
  };
}

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
        <div class="statistics-layout">
          <!-- Left Bandroll Canvas -->
          <div class="left-bandroll">
            <canvas
              id="pong-bandroll"
              class="pong-bandroll"
            ></canvas>
          </div>
          
          <!-- Center Statistics Content -->
          <div class="center-content">
            <h1 class="title">Game's Statistics</h1>
            
            <!-- Stats Navigation -->
            <div class="stats-nav mt-6">
              <button class="nav-btn active" data-view="overview">Overview</button>
              <button class="nav-btn" data-view="pong">🏓 Pong</button>
              <button class="nav-btn" data-view="race">🏁 Race</button>
            </div>
            
            <!-- Main Statistics Content -->
            <div class="stats-content mt-8">
              <!-- Overview Stats -->
              <div id="overview-stats" class="stats-section">
                <div class="stats-grid">
                  <div class="stat-card glow-red">
                    <div class="stat-value" id="total-games">0</div>
                    <div class="stat-label">Total Games</div>
                  </div>
                  <div class="stat-card glow-blue">
                    <div class="stat-value" id="total-wins">0</div>
                    <div class="stat-label">Total Wins</div>
                  </div>
                  <div class="stat-card glow-green">
                    <div class="stat-value" id="win-rate">0%</div>
                    <div class="stat-label">Win Rate</div>
                  </div>
                  <div class="stat-card glow-yellow">
                    <div class="stat-value" id="total-losses">0</div>
                    <div class="stat-label">Total Losses</div>
                  </div>
                </div>
              </div>
              
              <!-- Pong Stats -->
              <div id="pong-stats" class="stats-section hidden">
                <div class="game-detailed-grid">
                  <div class="game-card pong-themed">
                    <h3>🏓 Pong Statistics</h3>
                    <div class="game-stats-detailed">
                      <div class="game-stat">
                        <span>Games Played:</span>
                        <span id="pong-games">0</span>
                      </div>
                      <div class="game-stat">
                        <span>Wins:</span>
                        <span id="pong-wins">0</span>
                      </div>
                      <div class="game-stat">
                        <span>Losses:</span>
                        <span id="pong-losses">0</span>
                      </div>
                      <div class="game-stat">
                        <span>Win Rate:</span>
                        <span id="pong-winrate">0%</span>
                      </div>
                      <div class="game-stat">
                        <span>Best Streak:</span>
                        <span id="pong-streak">0</span>
                      </div>
                      <div class="game-stat">
                        <span>Total Points:</span>
                        <span id="pong-points">0</span>
                      </div>
                      <div class="game-stat">
                        <span>Avg Game Duration:</span>
                        <span id="pong-avg-duration">0:00</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <!-- Race Stats -->
              <div id="race-stats" class="stats-section hidden">
                <div class="game-detailed-grid">
                  <div class="game-card race-themed">
                    <h3>🏁 Race Statistics</h3>
                    <div class="game-stats-detailed">
                      <div class="game-stat">
                        <span>Races Finished:</span>
                        <span id="race-finished">0</span>
                      </div>
                      <div class="game-stat">
                        <span>Wins:</span>
                        <span id="race-wins">0</span>
                      </div>
                      <div class="game-stat">
                        <span>Losses:</span>
                        <span id="race-losses">0</span>
                      </div>
                      <div class="game-stat">
                        <span>Best Time:</span>
                        <span id="race-best-time">--:--</span>
                      </div>
                      <div class="game-stat">
                        <span>Average Time:</span>
                        <span id="race-avg-time">--:--</span>
                      </div>
                      <div class="game-stat">
                        <span>Crashes:</span>
                        <span id="race-crashes">0</span>
                      </div>
                      <div class="game-stat">
                        <span>Checkpoints Hit:</span>
                        <span id="race-checkpoints">0</span>
                      </div>
                      <div class="game-stat">
                        <span>Total Distance:</span>
                        <span id="race-distance">0m</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Footer Controls -->
            <div class="stats-footer mt-8">
              <button class="refresh-btn" id="refresh-stats">🔄 Refresh Stats</button>
            </div>
          </div>
          
          <!-- Right Bandroll Canvas -->
          <div class="right-bandroll">
            <canvas
              id="race-bandroll"
              class="race-bandroll"
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
            /* Main Layout */
            .statistics-layout {
                display: flex;
                width: 100%;
                height: 100vh;
                min-height: 100vh;
                gap: 2rem;
                padding: 2rem;
            }
            
            /* Bandroll Containers */
            .left-bandroll, .right-bandroll {
                flex: 0 0 150px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            /* Canvas Styles - Long Vertical Bandrolls */
            .pong-bandroll {
                width: 120px;
                height: 80vh;
                border-radius: 60px;
                border: 3px solid #fda5d5;
                background: linear-gradient(180deg, 
                    rgba(253, 165, 213, 0.1) 0%, 
                    rgba(253, 165, 213, 0.05) 50%, 
                    rgba(253, 165, 213, 0.1) 100%);
                box-shadow: 
                    0 0 20px rgba(253, 165, 213, 0.5),
                    inset 0 0 20px rgba(253, 165, 213, 0.2);
                transform: rotate(0deg);
                transition: all 0.3s ease;
            }
            
            .race-bandroll {
                width: 120px;
                height: 80vh;
                border-radius: 60px;
                border: 3px solid #fda5d5;
                background: linear-gradient(180deg, 
                    rgba(253, 165, 213, 0.3) 0%, 
                    rgba(253, 165, 213, 0.1) 50%, 
                    rgba(253, 165, 213, 0.3) 100%);
                box-shadow: 
                    0 0 30px rgba(253, 165, 213, 0.5),
                    inset 0 0 20px rgba(253, 165, 213, 0.2);
                transform: rotate(0deg);
                transition: all 0.3s ease;
            }
            
            .pong-bandroll:hover {
                transform: scale(1.05);
                box-shadow: 
                    0 0 40px rgba(255, 105, 180, 0.7),
                    inset 0 0 30px rgba(255, 105, 180, 0.3);
            }
            
            .race-bandroll:hover {
                transform: scale(1.05);
                box-shadow: 
                    0 0 40px rgba(255, 105, 180, 0.7),
                    inset 0 0 30px rgba(255, 105, 180, 0.3);
            }
            
            /* Center Content */
            .center-content {
                flex: 1;
                display: flex;
                flex-direction: column;
                align-items: center;
                max-width: 1200px;
                margin: 0 auto;
                padding: 0 2rem;
            }
            
            .title {
                font-size: 3rem;
                font-weight: bold;
                text-align: center;
                background: linear-gradient(45deg, #ff69b4, #44ff44, #ff69b4);
                background-size: 200% 200%;
                background-clip: text;
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                animation: gradientShift 3s ease-in-out infinite;
                text-shadow: 0 0 20px rgba(255, 105, 180, 0.5);
                margin-bottom: 2rem;
            }
            
            @keyframes gradientShift {
                0% { background-position: 0% 50%; }
                50% { background-position: 100% 50%; }
                100% { background-position: 0% 50%; }
            }

            /* Navigation Styles */
            .stats-nav {
                display: flex;
                justify-content: center;
                gap: 1rem;
                margin-bottom: 2rem;
            }

            .nav-btn {
                padding: 0.75rem 1.5rem;
                background: rgba(0, 0, 0, 0.5);
                border: 2px solid #444;
                color: #fff;
                cursor: pointer;
                transition: all 0.3s ease;
                border-radius: 25px;
                font-weight: bold;
                text-transform: uppercase;
                letter-spacing: 1px;
            }

            .nav-btn:hover {
                background: rgba(255, 255, 255, 0.1);
                border-color: #ff69b4;
                transform: translateY(-2px);
            }

            .nav-btn.active {
                background: linear-gradient(45deg, #ff69b4, #ff1493);
                border-color: #ff69b4;
                box-shadow: 0 0 20px rgba(255, 105, 180, 0.5);
            }

            /* Stats Grid */
            .stats-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
                gap: 1.5rem;
                margin-bottom: 2rem;
                width: 100%;
            }

            .stat-card {
                background: rgba(0, 0, 0, 0.7);
                border: 2px solid #444;
                border-radius: 15px;
                padding: 1.5rem;
                text-align: center;
                transition: all 0.3s ease;
                position: relative;
                overflow: hidden;
            }

            .stat-card::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
                transform: translateX(-100%);
                transition: transform 0.6s;
            }

            .stat-card:hover::before {
                transform: translateX(100%);
            }

            .stat-card:hover {
                transform: translateY(-5px);
                border-color: currentColor;
                box-shadow: 0 0 20px currentColor;
            }

            .glow-red { color: #ff4444; }
            .glow-blue { color: #4444ff; }
            .glow-green { color: #44ff44; }
            .glow-yellow { color: #ffff44; }
            .glow-purple { color: #ff44ff; }
            .glow-orange { color: #ff8844; }

            .stat-value {
                font-size: 2.5rem;
                font-weight: bold;
                margin-bottom: 0.5rem;
                text-shadow: 0 0 10px currentColor;
            }

            .stat-label {
                font-size: 0.9rem;
                color: #ccc;
                text-transform: uppercase;
                letter-spacing: 1px;
            }

            /* Level Progress */
            .level-section {
                display: flex;
                justify-content: center;
                width: 100%;
            }

            .level-card {
                background: rgba(0, 0, 0, 0.7);
                border: 2px solid #ff69b4;
                border-radius: 15px;
                padding: 1.5rem;
                min-width: 400px;
                max-width: 500px;
            }

            .level-info {
                display: flex;
                justify-content: space-between;
                margin-bottom: 1rem;
                font-size: 1.2rem;
            }

            .level-text {
                color: #ff69b4;
                font-weight: bold;
                text-shadow: 0 0 10px #ff69b4;
            }

            .xp-text {
                color: #ccc;
            }

            .progress-bar {
                height: 20px;
                background: #333;
                border-radius: 10px;
                overflow: hidden;
                border: 1px solid #555;
            }

            .progress-fill {
                height: 100%;
                background: linear-gradient(90deg, #ff69b4, #ff1493, #ff69b4);
                width: 0%;
                transition: width 1s ease;
                box-shadow: 0 0 10px #ff69b4;
            }

            /* Game Detailed Stats */
            .game-detailed-grid {
                display: flex;
                justify-content: center;
                width: 100%;
            }

            .game-card {
                background: rgba(0, 0, 0, 0.7);
                border: 2px solid #444;
                border-radius: 15px;
                padding: 2rem;
                text-align: center;
                min-width: 500px;
                max-width: 600px;
                width: 100%;
            }

            .pong-themed {
                border-color: #ff69b4;
                background: linear-gradient(135deg, rgba(255, 105, 180, 0.1), rgba(0, 0, 0, 0.7));
            }

            .race-themed {
                border-color: #ff69b4;
                background: linear-gradient(135deg, rgba(68, 255, 68, 0.1), rgba(0, 0, 0, 0.7));
            }

            .game-card h3 {
                margin-bottom: 2rem;
                font-size: 1.5rem;
                text-shadow: 0 0 10px currentColor;
            }

            .game-stats-detailed {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 1rem;
            }

            .game-stat {
                display: flex;
                justify-content: space-between;
                padding: 0.75rem;
                background: rgba(255, 255, 255, 0.05);
                border-radius: 8px;
                border: 1px solid rgba(255, 255, 255, 0.1);
            }

            .game-stat span:first-child {
                color: #ccc;
                font-weight: normal;
            }

            .game-stat span:last-child {
                color: #fff;
                font-weight: bold;
            }

            /* Footer */
            .stats-footer {
                text-align: center;
                margin-top: 2rem;
            }

            .refresh-btn {
                padding: 1rem 2rem;
                background: linear-gradient(45deg, #ff69b4, #ff1493);
                border: none;
                color: white;
                cursor: pointer;
                border-radius: 25px;
                font-weight: bold;
                transition: all 0.3s ease;
                font-size: 1rem;
            }

            .refresh-btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(255, 105, 180, 0.3);
            }

            /* Utility Classes */
            .hidden {
                display: none !important;
            }

            .stats-section {
                animation: fadeIn 0.5s ease;
                width: 100%;
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            /* Responsive Design */
            @media (max-width: 1200px) {
                .statistics-layout {
                    gap: 1rem;
                    padding: 1rem;
                }
                
                .left-bandroll, .right-bandroll {
                    flex: 0 0 100px;
                }
                
                .pong-bandroll, .race-bandroll {
                    width: 80px;
                    height: 70vh;
                }
                
                .center-content {
                    padding: 0 1rem;
                }
            }
            
            @media (max-width: 768px) {
                .statistics-layout {
                    flex-direction: column;
                    height: auto;
                }
                
                .left-bandroll, .right-bandroll {
                    flex: 0 0 80px;
                    order: 1;
                }
                
                .center-content {
                    order: 2;
                }
                
                .pong-bandroll, .race-bandroll {
                    width: 60vw;
                    height: 60px;
                }
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
    navButtons.forEach(btn => btn.classList.remove('active'));
    activeButton.classList.add('active');
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
