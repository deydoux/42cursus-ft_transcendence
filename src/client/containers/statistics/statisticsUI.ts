import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart,
  DoughnutController,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import {BaseComponent} from '../../components/BaseComponent';
import {DOMUtils} from '../../utils/dom';
import {StatisticsData} from '../../types/statistics';
import {StatsCanvas} from './statisticsCanvas';
import star from '../../assets/star.png';

Chart.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineController,
  LineElement,
  Title,
  Tooltip,
  Legend,
  BarElement,
  ArcElement,
  DoughnutController,
);

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
      <div class="flex w-full h-full">
        <!-- Left Bandroll Canvas -->
        <div class="hidden xl:block flex-none w-36 flex items-center h-full justify-center">
          <canvas
            id="pong-bandroll"
            class="w-30 h-4/5 rounded-full border-4 border-pink-400 bg-gradient-to-b from-pink-400/10 via-pink-400/5 to-pink-400/10 shadow-lg shadow-pink-400/50 transition-all duration-300"
          ></canvas>
        </div>

        <!-- Center Statistics Content -->
        <div class="relative flex-1 flex flex-col items-center max-w-6xl mx-auto px-8">

        <!-------------Starts---------------->
        <div class="hidden 2xl:block absolute top-[12px] right-[30px] hover:animate-[spin_1s_infinite] w-fit h-fit">
          <img class="h-15 rotate-[-5deg]" src="${star}" alt="Star decoration"></img>
        </div>
        <div class="hidden 2xl:block absolute top-[12px] left-[30px] hover:animate-[spin_1s_infinite] w-fit h-fit">
          <img class="h-15 rotate-[-5deg]" src="${star}" alt="Star decoration"></img>
        </div>

        <div class="flex items-center">
          <h1 class="text-5xl font-bold text-center bg-clip-text text-shadow-pink-300 text-shadow-lg/50 text-gray-300 mb-8">
            Game's Statistics
          </h1>
          <button title="Refresh stats" class="cursor-pointer bg-zinc-900 hover:bg-black text-white rounded-lg ml-4 mb-6" id="refresh-stats">
            <svg class="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> 
            <path d="M15.9775 8.71452L15.5355 8.2621C13.5829 6.26318 10.4171 6.26318 8.46447 8.2621C6.51184 10.261 6.51184 13.5019 8.46447 15.5008C10.4171 17.4997 13.5829 17.4997 15.5355 15.5008C16.671 14.3384 17.1462 12.7559 16.9611 11.242M15.9775 8.71452H13.3258M15.9775 8.71452V6" stroke="#fda5d5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> 
            <path d="M22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C21.5093 4.43821 21.8356 5.80655 21.9449 8" stroke="#fda5d5" stroke-width="2" stroke-linecap="round"></path> </g>
            </svg>  
            </button>
        </div>  
          
          <!-- Stats Navigation -->
          <div class="flex justify-center gap-4 mb-6">
            <button class="nav-btn flex items-center gap-2 px-6 py-3 bg-black/50 border-2 border-gray-600 text-white cursor-pointer transition-all duration-300 rounded-full font-bold uppercase tracking-wide hover:bg-white/10 hover:border-pink-400 hover:-translate-y-1 data-[active]:bg-gradient-to-r data-[active]:from-pink-400 data-[active]:to-pink-600 data-[active]:border-pink-400 data-[active]:shadow-lg data-[active]:shadow-pink-400/50" data-view="overview">
              <svg class="mb-2 w-6 h-6" version="1.0" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 64 64" enable-background="new 0 0 64 64" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> 
              <path fill="#ffff" d="M62.242,53.757L51.578,43.093C54.373,38.736,56,33.56,56,28C56,12.536,43.464,0,28,0S0,12.536,0,28 s12.536,28,28,28c5.56,0,10.736-1.627,15.093-4.422l10.664,10.664c2.344,2.344,6.142,2.344,8.485,0S64.586,56.101,62.242,53.757z M28,54C13.641,54,2,42.359,2,28S13.641,2,28,2s26,11.641,26,26S42.359,54,28,54z M60.828,60.828c-1.562,1.562-4.095,1.562-5.656,0 L44.769,50.425c2.145-1.606,4.051-3.513,5.657-5.656l10.402,10.402C62.391,56.732,62.391,59.266,60.828,60.828z"></path> <path fill="#ffff" d="M28,4C14.745,4,4,14.745,4,28s10.745,24,24,24s24-10.745,24-24S41.255,4,28,4z M28,50 C15.85,50,6,40.15,6,28S15.85,6,28,6s22,9.85,22,22S40.15,50,28,50z"></path> 
              <path fill="#ffff" d="M28,11c-0.553,0-1,0.447-1,1s0.447,1,1,1c8.284,0,15,6.716,15,15c0,0.553,0.447,1,1,1s1-0.447,1-1 C45,18.611,37.389,11,28,11z"></path> </g> </g>
              </svg>
              Overview
            </button>
            <button class="nav-btn flex items-center gap-2 px-6 py-3 bg-black/50 border-2 border-gray-600 text-white cursor-pointer transition-all duration-300 rounded-full font-bold uppercase tracking-wide hover:bg-white/10 hover:border-pink-400 hover:-translate-y-1" data-view="pong">
              <svg class="mb-2 w-6 h-6" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <defs> <style>.cls-1{fill:none;stroke:#ffff;stroke-linejoin:round;stroke-width:2px;}</style> </defs> <title></title> <g data-name="Layer 29" id="Layer_29"> 
              <path class="cls-1" d="M62,34A14,14,0,1,0,45,47.67V59a3,3,0,0,0,3,3h0a3,3,0,0,0,3-3V47.67A14,14,0,0,0,62,34Z"></path> <line class="cls-1" x1="37" x2="59" y1="42" y2="42"></line> <path class="cls-1" d="M48,24A10,10,0,0,1,58,34"></path> 
              <path class="cls-1" d="M2,34A14,14,0,1,1,19,47.67V59a3,3,0,0,1-3,3h0a3,3,0,0,1-3-3V47.67A14,14,0,0,1,2,34Z"></path> <line class="cls-1" x1="27" x2="5" y1="42" y2="42"></line> 
              <path class="cls-1" d="M16,24A10,10,0,0,1,26,34"></path> <circle class="cls-1" cx="32" cy="15" r="5"></circle> <circle class="cls-1" cx="52" cy="7" r="5"></circle> <circle class="cls-1" cx="12" cy="7" r="5"></circle> </g> </g>
              </svg>
              Pong
            </button>
            <button class="nav-btn flex items-center gap-2 px-6 py-3 bg-black/50 border-2 border-gray-600 text-white cursor-pointer transition-all duration-300 rounded-full font-bold uppercase tracking-wide hover:bg-white/10 hover:border-pink-400 hover:-translate-y-1" data-view="race">
              <svg class="h-6 w-6" version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <style type="text/css"> .st0{fill:#ffff;} </style> <g> 
              <path class="st0" d="M222.537,232.693h49.21l-0.469-12.424l-19.929-1.29c-0.423-0.062-0.782-0.359-0.938-0.782l-1.681-6.458 c-0.141-0.399-0.078-0.86,0.156-1.212c0.25-0.351,0.657-0.563,1.095-0.563h18.951c-1.407-13.127-9.78-22.853-22.962-24.839 c-18.741-2.815-33.228,10.602-30.93,26.708C215.978,218.386,219.261,228.714,222.537,232.693z M259.628,196.51l-5.293-0.344 c0,0-2.432-3.135-4.527-5.575C251.903,190.591,257.189,192.686,259.628,196.51z"></path> <path class="st0" d="M65.417,237.509c-28.796,0-52.142,23.346-52.142,52.149c0,28.804,23.346,52.149,52.142,52.149 c28.804,0,52.149-23.346,52.149-52.149C117.566,260.856,94.221,237.509,65.417,237.509z M65.417,317.156 c-15.176,0-27.49-12.298-27.49-27.498c0-15.191,12.314-27.49,27.49-27.49c15.2,0,27.498,12.299,27.498,27.49 C92.915,304.858,80.617,317.156,65.417,317.156z"></path> <path class="st0" d="M65.417,281.121c-4.707,0-8.522,3.831-8.522,8.538c0,4.715,3.815,8.538,8.522,8.538 c4.715,0,8.546-3.823,8.546-8.538C73.963,284.952,70.132,281.121,65.417,281.121z"></path> <path class="st0" d="M393.738,229.965c-38.874-5.817-78.622-9.453-110.967-11.72c-2.291,10.148-9.75,19.264-19.186,19.264 c-11.376,0-51.203,0-51.203,0v-22.751v-44.566c-61.97,6.756-101.288,39.296-124.165,64.268 c21.658,8.976,36.942,30.336,36.942,55.198c0,5.583-0.79,10.977-2.228,16.122h214.946c-1.439-5.145-2.228-10.539-2.228-16.122 C335.647,257.275,361.557,230.84,393.738,229.965z"></path> <path class="st0" d="M65.417,229.926c1.9,0,3.768,0.102,5.614,0.266l10.508-14.496v-33.173H0v83.439l8.741,4.902 C16.646,247.111,39.061,229.926,65.417,229.926z"></path> <path class="st0" d="M470.281,286.813v-9.476l18.021-9.476c0,0,3.331-11.04,3.331-18.624c-21.219-7.005-49.57-11.102-75.738-15.684 c22.862,8.397,39.217,30.375,39.217,56.105c0,5.583-0.79,10.977-2.236,16.122H512v-18.967H470.281z"></path> <path class="st0" d="M395.38,237.509c-28.796,0-52.15,23.346-52.15,52.149c0,28.804,23.354,52.149,52.15,52.149 c28.804,0,52.149-23.346,52.149-52.149C447.529,260.856,424.184,237.509,395.38,237.509z M395.38,317.156 c-15.192,0-27.498-12.298-27.498-27.498c0-15.191,12.306-27.49,27.498-27.49c15.184,0,27.498,12.299,27.498,27.49 C422.878,304.858,410.564,317.156,395.38,317.156z"></path> <path class="st0" d="M395.38,281.121c-4.715,0-8.538,3.831-8.538,8.538c0,4.715,3.823,8.538,8.538,8.538 c4.715,0,8.53-3.823,8.53-8.538C403.91,284.952,400.095,281.121,395.38,281.121z"></path> </g> </g>
              </svg>
              Race
            </button>
          </div>

          <!-- Overview Stats with Charts -->
          <div id="overview-stats" class="stats-section w-full">
            <div class="grid grid-cols-1 gap-8 max-w-6xl mx-auto">
 
              <!-- Game Mode Distribution -->
              <div class="bg-black/70 border-2 border-gray-600 rounded-xl p-6 max-w-2xl mx-auto w-full">
                <h4 class="text-xl text-gray-300 mb-4 text-center">Game Mode Distribution</h4>
                <canvas id="game-mode-chart" class="w-full" height="200"></canvas>
                <div class="flex justify-center gap-4 mt-4 text-sm">
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 bg-pink-400 rounded"></div>
                    <span class="text-gray-400">Pong</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <div class="w-3 h-3 bg-purple-300 rounded"></div>
                    <span class="text-gray-400">Race</span>
                  </div>
                </div>
              </div>

              <!-- Summary Stats Cards -->
              <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div class="stat-card bg-black/70 border-2 border-gray-600 rounded-xl p-4 text-center transition-all duration-300 hover:border-red-400 text-red-400">
                  <div class="text-2xl font-bold mb-1" id="total-games">0</div>
                  <div class="text-xs text-gray-300 uppercase">Total Games</div>
                </div>
                
                <div class="stat-card bg-black/70 border-2 border-gray-600 rounded-xl p-4 text-center transition-all duration-300 hover:border-green-400 text-green-400">
                  <div class="text-2xl font-bold mb-1" id="total-wins">0</div>
                  <div class="text-xs text-gray-300 uppercase">Total Wins</div>
                </div>
                
                <div class="stat-card bg-black/70 border-2 border-gray-600 rounded-xl p-4 text-center transition-all duration-300 hover:border-blue-400 text-blue-400">
                  <div class="text-2xl font-bold mb-1" id="win-rate">0%</div>
                  <div class="text-xs text-gray-300 uppercase">Win Rate</div>
                </div>
                
                <div class="stat-card bg-black/70 border-2 border-gray-600 rounded-xl p-4 text-center transition-all duration-300 hover:border-yellow-400 text-yellow-400">
                  <div class="text-2xl font-bold mb-1" id="total-losses">0</div>
                  <div class="text-xs text-gray-300 uppercase">Total Losses</div>
                </div>
              </div>

            </div>
          </div>
            
            <!-- Pong Stats -->
            <div id="pong-stats" class="stats-section hidden w-full">
              <div class="flex justify-center w-full">
                <div class="bg-black/70 border-2 border-pink-300 rounded-xl p-8 text-center min-w-96 max-w-2xl w-full bg-gradient-to-br from-pink-400/10 to-black/70">
                <div class="justify-center flex">
                  <svg class="h-6 w-6 mt-2" viewBox="0 0 64.00 64.00" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <defs> <style>.cls-1{fill:none;stroke:#ffffff;stroke-linejoin:round;stroke-width:3.072;}</style> </defs> <title></title> <g data-name="Layer 29" id="Layer_29"> 
                  <path class="cls-1" d="M62,34A14,14,0,1,0,45,47.67V59a3,3,0,0,0,3,3h0a3,3,0,0,0,3-3V47.67A14,14,0,0,0,62,34Z"></path> <line class="cls-1" x1="37" x2="59" y1="42" y2="42"></line> 
                  <path class="cls-1" d="M48,24A10,10,0,0,1,58,34"></path> <path class="cls-1" d="M2,34A14,14,0,1,1,19,47.67V59a3,3,0,0,1-3,3h0a3,3,0,0,1-3-3V47.67A14,14,0,0,1,2,34Z"></path> <line class="cls-1" x1="27" x2="5" y1="42" y2="42"></line> <path class="cls-1" d="M16,24A10,10,0,0,1,26,34"></path> <circle class="cls-1" cx="32" cy="15" r="5"></circle> <circle class="cls-1" cx="52" cy="7" r="5"></circle> <circle class="cls-1" cx="12" cy="7" r="5"></circle> </g> </g>
                  </svg>
                  <h3 class="text-2xl m-2 drop-shadow-lg text-pink-300"> Pong Statistics </h3>
                </div>  
                  
                  <!-- Toggle Button -->
                  <div class="flex justify-center mb-4">
                    <div class="bg-white/10 rounded-full border border-white/20">
                    <button id="pong-toggle-stat" class="pong-toggle-btn px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 text-white hover:text-white">
                        <svg class="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><defs><style>.a,.b{fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.5px;}.a{fill-rule:evenodd;}</style></defs>
                        <path class="a" d="M3,16V15a9,9,0,0,1,9-9h0a9,9,0,0,1,9,9v1"></path><circle class="b" cx="12" cy="16" r="2"></circle><line class="b" x1="13.41089" x2="16.5" y1="14.58911" y2="11.5"></line></g>
                        </svg>
                      </button>  
                    <button id="pong-toggle-elo" class="pong-toggle-btn active px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 bg-pink-300 text-white">
                        <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> 
                        <path d="M21 21H7.8C6.11984 21 5.27976 21 4.63803 20.673C4.07354 20.3854 3.6146 19.9265 3.32698 19.362C3 18.7202 3 17.8802 3 16.2V3M6 15L10 11L14 15L20 9M20 9V13M20 9H16" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g>
                        </svg>
                      </button>
                      <button id="pong-toggle-history" class="pong-toggle-btn px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 text-white hover:text-white">
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
                    <canvas id="pong-elo-chart" width="600" height="300" class="max-w-full max-w-[600px] max-h-[300px]"></canvas>
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
                          <span class="text-white font-bold" id="pong-casual-current-streak">0</span>
                        </div>
                        <div class="flex justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                          <span class="text-gray-300">Best Streak:</span>
                          <span class="text-white font-bold" id="pong-casual-best-streak">0:00</span>
                        </div>
                        <div class="flex justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                          <span class="text-gray-300">(RANKED) Current Streak:</span>
                          <span class="text-white font-bold" id="pong-ranked-current-streak">0</span>
                        </div>
                        <div class="flex justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                          <span class="text-gray-300">(RANKED) Best Streak:</span>
                          <span class="text-white font-bold" id="pong-ranked-best-streak">0:00</span>
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
                <div class="bg-black/70 border-2 border-purple-300 rounded-xl p-8 text-center min-w-96 max-w-2xl w-full bg-gradient-to-br from-purple-300/10 to-black/70">
                  <div class="justify-center flex">
                    <svg class="h-6 w-10 mt-3" version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 512 512" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <style type="text/css"> .st0{fill:#ffff;} </style> <g> 
                    <path class="st0" d="M222.537,232.693h49.21l-0.469-12.424l-19.929-1.29c-0.423-0.062-0.782-0.359-0.938-0.782l-1.681-6.458 c-0.141-0.399-0.078-0.86,0.156-1.212c0.25-0.351,0.657-0.563,1.095-0.563h18.951c-1.407-13.127-9.78-22.853-22.962-24.839 c-18.741-2.815-33.228,10.602-30.93,26.708C215.978,218.386,219.261,228.714,222.537,232.693z M259.628,196.51l-5.293-0.344 c0,0-2.432-3.135-4.527-5.575C251.903,190.591,257.189,192.686,259.628,196.51z"></path> <path class="st0" d="M65.417,237.509c-28.796,0-52.142,23.346-52.142,52.149c0,28.804,23.346,52.149,52.142,52.149 c28.804,0,52.149-23.346,52.149-52.149C117.566,260.856,94.221,237.509,65.417,237.509z M65.417,317.156 c-15.176,0-27.49-12.298-27.49-27.498c0-15.191,12.314-27.49,27.49-27.49c15.2,0,27.498,12.299,27.498,27.49 C92.915,304.858,80.617,317.156,65.417,317.156z"></path> <path class="st0" d="M65.417,281.121c-4.707,0-8.522,3.831-8.522,8.538c0,4.715,3.815,8.538,8.522,8.538 c4.715,0,8.546-3.823,8.546-8.538C73.963,284.952,70.132,281.121,65.417,281.121z"></path> <path class="st0" d="M393.738,229.965c-38.874-5.817-78.622-9.453-110.967-11.72c-2.291,10.148-9.75,19.264-19.186,19.264 c-11.376,0-51.203,0-51.203,0v-22.751v-44.566c-61.97,6.756-101.288,39.296-124.165,64.268 c21.658,8.976,36.942,30.336,36.942,55.198c0,5.583-0.79,10.977-2.228,16.122h214.946c-1.439-5.145-2.228-10.539-2.228-16.122 C335.647,257.275,361.557,230.84,393.738,229.965z"></path> <path class="st0" d="M65.417,229.926c1.9,0,3.768,0.102,5.614,0.266l10.508-14.496v-33.173H0v83.439l8.741,4.902 C16.646,247.111,39.061,229.926,65.417,229.926z"></path> <path class="st0" d="M470.281,286.813v-9.476l18.021-9.476c0,0,3.331-11.04,3.331-18.624c-21.219-7.005-49.57-11.102-75.738-15.684 c22.862,8.397,39.217,30.375,39.217,56.105c0,5.583-0.79,10.977-2.236,16.122H512v-18.967H470.281z"></path> <path class="st0" d="M395.38,237.509c-28.796,0-52.15,23.346-52.15,52.149c0,28.804,23.354,52.149,52.15,52.149 c28.804,0,52.149-23.346,52.149-52.149C447.529,260.856,424.184,237.509,395.38,237.509z M395.38,317.156 c-15.192,0-27.498-12.298-27.498-27.498c0-15.191,12.306-27.49,27.498-27.49c15.184,0,27.498,12.299,27.498,27.49 C422.878,304.858,410.564,317.156,395.38,317.156z"></path> <path class="st0" d="M395.38,281.121c-4.715,0-8.538,3.831-8.538,8.538c0,4.715,3.823,8.538,8.538,8.538 c4.715,0,8.53-3.823,8.53-8.538C403.91,284.952,400.095,281.121,395.38,281.121z"></path> </g> </g>
                    </svg>  
                    <h3 class="text-2xl m-2 drop-shadow-lg text-purple-300"> Race Statistics </h3>
                  </div>

                  <!-- Toggle Button -->
                    <div class="flex justify-center mb-4">
                      <div class="bg-white/10 rounded-full border border-white/20">
                      <button id="race-toggle-stat" class="race-toggle-btn px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 text-white hover:text-white">
                          <svg class="w-6 h-6" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><defs><style>.a,.b{fill:none;stroke:#000000;stroke-linecap:round;stroke-linejoin:round;stroke-width:1.5px;}.a{fill-rule:evenodd;}</style></defs>
                          <path class="a" d="M3,16V15a9,9,0,0,1,9-9h0a9,9,0,0,1,9,9v1"></path><circle class="b" cx="12" cy="16" r="2"></circle><line class="b" x1="13.41089" x2="16.5" y1="14.58911" y2="11.5"></line></g>
                          </svg>
                        </button>  
                      <button id="race-toggle-elo" class="race-toggle-btn active px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 bg-purple-300 text-white">
                          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> 
                          <path d="M21 21H7.8C6.11984 21 5.27976 21 4.63803 20.673C4.07354 20.3854 3.6146 19.9265 3.32698 19.362C3 18.7202 3 17.8802 3 16.2V3M6 15L10 11L14 15L20 9M20 9V13M20 9H16" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path> </g>
                          </svg>
                        </button>
                        <button id="race-toggle-history" class="race-toggle-btn px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 text-white hover:text-white">
                          <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> 
                          <path d="M12 8V12L14.5 14.5" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path> 
                          <path d="M5.60423 5.60423L5.0739 5.0739V5.0739L5.60423 5.60423ZM4.33785 6.87061L3.58786 6.87438C3.58992 7.28564 3.92281 7.61853 4.33408 7.6206L4.33785 6.87061ZM6.87963 7.63339C7.29384 7.63547 7.63131 7.30138 7.63339 6.88717C7.63547 6.47296 7.30138 6.13549 6.88717 6.13341L6.87963 7.63339ZM5.07505 4.32129C5.07296 3.90708 4.7355 3.57298 4.32129 3.57506C3.90708 3.57715 3.57298 3.91462 3.57507 4.32882L5.07505 4.32129ZM3.75 12C3.75 11.5858 3.41421 11.25 3 11.25C2.58579 11.25 2.25 11.5858 2.25 12H3.75ZM16.8755 20.4452C17.2341 20.2378 17.3566 19.779 17.1492 19.4204C16.9418 19.0619 16.483 18.9393 16.1245 19.1468L16.8755 20.4452ZM19.1468 16.1245C18.9393 16.483 19.0619 16.9418 19.4204 17.1492C19.779 17.3566 20.2378 17.2341 20.4452 16.8755L19.1468 16.1245ZM5.14033 5.07126C4.84598 5.36269 4.84361 5.83756 5.13505 6.13191C5.42648 6.42626 5.90134 6.42862 6.19569 6.13719L5.14033 5.07126ZM18.8623 5.13786C15.0421 1.31766 8.86882 1.27898 5.0739 5.0739L6.13456 6.13456C9.33366 2.93545 14.5572 2.95404 17.8017 6.19852L18.8623 5.13786ZM5.0739 5.0739L3.80752 6.34028L4.86818 7.40094L6.13456 6.13456L5.0739 5.0739ZM4.33408 7.6206L6.87963 7.63339L6.88717 6.13341L4.34162 6.12062L4.33408 7.6206ZM5.08784 6.86684L5.07505 4.32129L3.57507 4.32882L3.58786 6.87438L5.08784 6.86684ZM12 3.75C16.5563 3.75 20.25 7.44365 20.25 12H21.75C21.75 6.61522 17.3848 2.25 12 2.25V3.75ZM12 20.25C7.44365 20.25 3.75 16.5563 3.75 12H2.25C2.25 17.3848 6.61522 21.75 12 21.75V20.25ZM16.1245 19.1468C14.9118 19.8483 13.5039 20.25 12 20.25V21.75C13.7747 21.75 15.4407 21.2752 16.8755 20.4452L16.1245 19.1468ZM20.25 12C20.25 13.5039 19.8483 14.9118 19.1468 16.1245L20.4452 16.8755C21.2752 15.4407 21.75 13.7747 21.75 12H20.25ZM6.19569 6.13719C7.68707 4.66059 9.73646 3.75 12 3.75V2.25C9.32542 2.25 6.90113 3.32791 5.14033 5.07126L6.19569 6.13719Z" fill="#000000"></path> </g>
                          </svg>
                        </button>
                      </div>
                    </div>

                    <!-- Current ELO Display -->
                    <div class="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
                      <div class="text-lg text-gray-300">Current ELO</div>
                      <div class="text-3xl font-bold text-purple-300" id="race-current-elo">--</div>
                    </div>
                    
                    <!-- ELO Chart -->
                    <div id="race-elo-section" class="mb-6 p-4 bg-white/5 rounded-lg border border-white/10">
                      <h4 class="text-lg text-gray-300 mb-4">ELO Evolution</h4>
                      <canvas id="race-elo-chart" width="600" height="300" class="max-w-full max-w-[600px] max-h-[300px]"></canvas>
                    </div>

                    <!-- Match History -->
                    <div id="race-history-section" class="mb-6 p-4 bg-white/5 rounded-lg border border-white/10 hidden">
                      <h4 class="text-lg text-gray-300 mb-4">Recent Matches</h4>
                      <div id="race-match-list" class="space-y-2 max-h-50 overflow-y-auto">
                        <!-- Match history will be populated here -->
                      </div>
                    </div>

                    <!-- Match Stat -->
                    <div id="race-stat-section" class="mb-6 p-4 bg-white/5 rounded-lg border border-white/10 hidden">
                      <h4 class="text-lg text-gray-300 mb-4">Game Statistics</h4>
                      <div id="race-match-list" class="space-y-2 h-50 overflow-y-auto">
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
                            <span class="text-white font-bold" id="race-winrate">0%</span>
                          </div>
                          <div class="flex justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                          <span class="text-gray-300">Current Streak:</span>
                          <span class="text-white font-bold" id="race-casual-current-streak">0</span>
                        </div>
                        <div class="flex justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                          <span class="text-gray-300">Best Streak:</span>
                          <span class="text-white font-bold" id="race-casual-best-streak">0:00</span>
                        </div>
                        <div class="flex justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                          <span class="text-gray-300">(RANKED) Current Streak:</span>
                          <span class="text-white font-bold" id="race-ranked-current-streak">0</span>
                        </div>
                        <div class="flex justify-between p-3 bg-white/5 rounded-lg border border-white/10">
                          <span class="text-gray-300">(RANKED) Best Streak:</span>
                          <span class="text-white font-bold" id="race-ranked-best-streak">0:00</span>
                        </div>
                        </div>
                      </div>
                    </div>

                </div>
              </div>
            </div>
            <!--------------- END OF RACE -------------------->

          </div>
        </div>
        
        <!-- Right Bandroll Canvas -->
        <div class="hidden xl:block flex-none w-36 flex items-center justify-center">
          <canvas
            id="race-bandroll"
            class="w-30 h-4/5 rounded-full border-4 border-pink-400 bg-gradient-to-b from-pink-400/30 via-pink-400/10 to-pink-400/30 shadow-lg shadow-pink-400/50 transition-all duration-300"
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

    const raceToggleElo = container.querySelector('#race-toggle-elo');
    const raceToggleHistory = container.querySelector('#race-toggle-history');
    const raceToggleStat = container.querySelector('#race-toggle-stat');

    pongToggleElo?.addEventListener('click', () => {
      this.togglePongView('elo', container);
    });

    pongToggleHistory?.addEventListener('click', () => {
      this.togglePongView('history', container);
    });

    pongToggleStat?.addEventListener('click', () => {
      this.togglePongView('stat', container);
    });

    raceToggleElo?.addEventListener('click', () => {
      this.toggleRaceView('elo', container);
    });

    raceToggleHistory?.addEventListener('click', () => {
      this.toggleRaceView('history', container);
    });

    raceToggleStat?.addEventListener('click', () => {
      this.toggleRaceView('stat', container);
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

    /* Heatmap styles */
    #activity-heatmap {
      scrollbar-width: thin;
      scrollbar-color: #4a5568 #1a202c;
    }
    
    #activity-heatmap::-webkit-scrollbar {
      height: 6px;
    }
    
    #activity-heatmap::-webkit-scrollbar-track {
      background: #1a202c;
    }
    
    #activity-heatmap::-webkit-scrollbar-thumb {
      background: #4a5568;
      border-radius: 3px;
    }
    
    #activity-heatmap::-webkit-scrollbar-thumb:hover {
      background: #718096;
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
      eloBtn?.classList.add('active', 'bg-pink-300', 'text-white');
      eloBtn?.classList.remove('text-gray-300');
      historyBtn?.classList.remove('active', 'bg-pink-300', 'text-white');
      historyBtn?.classList.add('text-gray-300');
      statBtn?.classList.remove('active', 'bg-pink-300', 'text-white');
      statBtn?.classList.add('text-gray-300');
    } else if (view === 'history') {
      eloSection?.classList.add('hidden');
      statSection?.classList.add('hidden');
      historySection?.classList.remove('hidden');

      // Update button styles
      historyBtn?.classList.add('active', 'bg-pink-300', 'text-white');
      historyBtn?.classList.remove('text-gray-300');
      eloBtn?.classList.remove('active', 'bg-pink-300', 'text-white');
      eloBtn?.classList.add('text-gray-300');
      statBtn?.classList.remove('active', 'bg-pink-300', 'text-white');
      statBtn?.classList.add('text-gray-300');

      // Load match history if data is available
      if (this.statisticsData) {
        this.updateMatchHistory(
          container,
          '#pong-match-list',
          this.statisticsData.pongStats,
        );
      }
    } else {
      eloSection?.classList.add('hidden');
      historySection?.classList.add('hidden');
      statSection?.classList.remove('hidden');

      statBtn?.classList.add('active', 'bg-pink-300', 'text-white');
      statBtn?.classList.remove('text-gray-300');
      historyBtn?.classList.remove('active', 'bg-pink-300', 'text-white');
      historyBtn?.classList.add('text-gray-300');
      eloBtn?.classList.remove('active', 'bg-pink-300', 'text-white');
      eloBtn?.classList.add('text-gray-300');
    }
  }

  private toggleRaceView(
    view: 'elo' | 'history' | 'stat',
    container: HTMLElement,
  ): void {
    const eloSection = container.querySelector('#race-elo-section');
    const statSection = container.querySelector('#race-stat-section');
    const historySection = container.querySelector('#race-history-section');
    const eloBtn = container.querySelector('#race-toggle-elo');
    const statBtn = container.querySelector('#race-toggle-stat');
    const historyBtn = container.querySelector('#race-toggle-history');

    if (view === 'elo') {
      eloSection?.classList.remove('hidden');
      statSection?.classList.add('hidden');
      historySection?.classList.add('hidden');

      // Update button styles
      eloBtn?.classList.add('active', 'bg-purple-300');
      eloBtn?.classList.remove('text-gray-300');
      historyBtn?.classList.remove('active', 'bg-purple-300');
      statBtn?.classList.remove('active', 'bg-purple-300');
    } else if (view === 'history') {
      eloSection?.classList.add('hidden');
      statSection?.classList.add('hidden');
      historySection?.classList.remove('hidden');

      // Update button styles
      historyBtn?.classList.add('active', 'bg-purple-300');
      historyBtn?.classList.remove('text-gray-300');
      eloBtn?.classList.remove('active', 'bg-purple-300');
      statBtn?.classList.remove('active', 'bg-purple-300');

      // Load match history if data is available
      if (this.statisticsData) {
        this.updateMatchHistory(
          container,
          '#race-match-list',
          this.statisticsData.raceStats,
        );
      }
    } else {
      eloSection?.classList.add('hidden');
      historySection?.classList.add('hidden');
      statSection?.classList.remove('hidden');

      statBtn?.classList.add('active', 'bg-purple-300');
      historyBtn?.classList.remove('active', 'bg-purple-300');
      eloBtn?.classList.remove('active', 'bg-purple-300');
    }
  }

  private updateMatchHistory(
    container: HTMLElement,
    select: string,
    data: StatisticsData['pongStats'] | StatisticsData['raceStats'],
  ): void {
    if (!data) return;
    const matchList = container.querySelector(select);
    if (!matchList) return;

    const matches = data.matches || [];

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
            ${match.result === 'tie' ? '-' : match.winner.id === user?.id ? '✓' : '✗'}
          </span>
        </div>
        <span class="text-white text-sm">${match.result === 'forfeit' ? 'Winned by forfeit' : match.result === 'tie' ? 'Tie' : match.winner.id === user?.id ? 'Won ' : 'Lost'} against ${match.winner.id === user?.id ? match.loser.username : match.winner.username}</span>
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
    if (this.currentView === 'overview') {
      this.drawGameModeChart(data.gameModeDistribution);
    }
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
      '#pong-casual-best-streak',
      data.pongStats.casualBestStreak.toString(),
    );
    this.updateElement(
      container,
      '#pong-casual-current-streak',
      data.pongStats.casualCurrentStreak.toString(),
    );
    this.updateElement(
      container,
      '#pong-ranked-best-streak',
      data.pongStats.rankedBestStreak.toString(),
    );
    this.updateElement(
      container,
      '#pong-ranked-current-streak',
      data.pongStats.rankedCurrentStreak.toString(),
    );
    this.updateElement(
      container,
      '#pong-current-elo',
      data.pongStats.currentElo?.toString() || '--',
    );
    this.drawEloChart('pong-elo-chart', data.pongStats.eloHistory, '#f472b6');

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
      '#race-casual-best-streak',
      data.raceStats.casualBestStreak.toString(),
    );
    this.updateElement(
      container,
      '#race-casual-current-streak',
      data.raceStats.casualCurrentStreak.toString(),
    );
    this.updateElement(
      container,
      '#race-ranked-best-streak',
      data.raceStats.rankedBestStreak.toString(),
    );
    this.updateElement(
      container,
      '#race-ranked-current-streak',
      data.raceStats.rankedCurrentStreak.toString(),
    );
    this.updateElement(
      container,
      '#race-current-elo',
      data.raceStats.currentElo?.toString() || '--',
    );
    this.drawEloChart('race-elo-chart', data.raceStats.eloHistory, '#d8b4fe');
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

  // Replace the drawEloChart method with this:

  private drawEloChart(
    canvasId: string,
    eloHistory: {value: number; createdAt: string}[],
    color: string,
  ): void {
    const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
    if (!canvas || !eloHistory.length) return;

    // Destroy existing chart if it exists
    const existingChart = Chart.getChart(canvas);
    if (existingChart) {
      existingChart.destroy();
    }

    // Prepare data
    const labels = eloHistory.map(entry => {
      const date = new Date(entry.createdAt);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    });

    const data = eloHistory.map(entry => entry.value);

    // Create the chart
    new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'ELO Rating',
            data: data,
            borderColor: color,
            backgroundColor: color + '20', // Add transparency for fill
            borderWidth: 3,
            pointBackgroundColor: color,
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 5,
            pointHoverRadius: 8,
            pointHoverBackgroundColor: color,
            pointHoverBorderColor: '#ffffff',
            pointHoverBorderWidth: 3,
            fill: false,
            tension: 0.4, // This creates the smooth curve
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index',
        },
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            titleColor: '#ffffff',
            bodyColor: '#ffffff',
            borderColor: '#666666',
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: false,
            callbacks: {
              title: context => {
                const index = context[0].dataIndex;
                const date = new Date(eloHistory[index].createdAt);
                return date.toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                });
              },
              label: context => {
                return `ELO: ${context.parsed.y}`;
              },
            },
          },
        },
        scales: {
          x: {
            display: true,
            border: {
              display: false,
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
            ticks: {
              color: '#888888',
              maxTicksLimit: 6,
              font: {
                size: 10,
              },
            },
            title: {
              display: true,
              text: 'Date',
              color: '#aaaaaa',
              font: {
                size: 12,
                weight: 'bold',
              },
            },
          },
          y: {
            display: true,
            border: {
              display: false, // This replaces drawBorder
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)',
            },
            ticks: {
              color: '#888888',
              font: {
                size: 10,
              },
            },
            title: {
              display: true,
              text: 'ELO Rating',
              color: '#aaaaaa',
              font: {
                size: 12,
                weight: 'bold',
              },
            },
          },
        },
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart',
        },
      },
    });
  }

  private drawGameModeChart(gameModeDistribution: {
    pong: {casual: number; ranked: number};
    race: {casual: number; ranked: number};
  }): void {
    const canvas = document.getElementById(
      'game-mode-chart',
    ) as HTMLCanvasElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = 200;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Chart data
    const data = [
      {
        label: 'Pong Casual',
        value: gameModeDistribution.pong.casual,
        color: '#fda5d5',
      },
      {
        label: 'Pong Ranked',
        value: gameModeDistribution.pong.ranked,
        color: '#ff4cafff',
      },
      {
        label: 'Race Casual',
        value: gameModeDistribution.race.casual,
        color: '#d88ff5ff',
      },
      {
        label: 'Race Ranked',
        value: gameModeDistribution.race.ranked,
        color: '#cc4efdff',
      },
    ];

    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return;

    // Draw grouped bar chart
    const padding = 60;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;
    const barWidth = chartWidth / 4 - 10;
    const maxValue = Math.max(...data.map(d => d.value));

    data.forEach((item, index) => {
      const barHeight = (item.value / maxValue) * chartHeight * 0.8;
      const x = padding + index * (barWidth + 10);
      const y = padding + chartHeight - barHeight;

      // Draw bar
      ctx.fillStyle = item.color;
      ctx.fillRect(x, y, barWidth, barHeight);

      // Draw value label
      ctx.fillStyle = '#fff';
      ctx.font = '12px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(item.value.toString(), x + barWidth / 2, y - 5);

      // Draw category label
      ctx.fillStyle = '#888';
      ctx.font = '10px Arial';
      const words = item.label.split(' ');
      words.forEach((word, wordIndex) => {
        ctx.fillText(
          word,
          x + barWidth / 2,
          padding + chartHeight + 15 + wordIndex * 12,
        );
      });
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
