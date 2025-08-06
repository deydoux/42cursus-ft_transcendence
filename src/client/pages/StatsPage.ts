import '../styles/stats-page.css';
import {StatsCanvas} from '../containers/statsCanvas.ts';
import {html} from '../utils/html.ts';
import {renderStats} from '../containers/renderStats.ts';

export function renderStatsPage(): void {
  const right = document.getElementById('right-container');
  const left = document.getElementById('left-container');
  if (!(right && left))
    return console.error('Could not find right and left containers');

  left.className = 'flex-1 h-full';
  right.className =
    'w-[500px] flex-none h-full flex flex-col gap-5 items-center';

  left.appendChild(renderStats());
  right.appendChild(
    html`<div class="w-full flex-1 rounded-[30px] border"></div>`,
  );
  right.appendChild(
    html`<div class="h-14 w-full flex-none rounded-[30px] border"></div>`,
  );

  // Get canvas and setup context
  const pongBandroll = document.getElementById(
    'pong-bandroll',
  ) as HTMLCanvasElement;
  const raceBandroll = document.getElementById(
    'race-bandroll',
  ) as HTMLCanvasElement;
  if (!pongBandroll || !raceBandroll) {
    console.error('Could not find canvas elements');
    return;
  }

  const ctx_race = raceBandroll.getContext('2d');
  const ctx_pong = pongBandroll.getContext('2d');
  if (!ctx_race || !ctx_pong) {
    console.error('Could not get canvas context');
    return;
  }

  ctx_race.canvas.width = 1920;
  ctx_race.canvas.height = 200;
  ctx_race.imageSmoothingEnabled = true;

  ctx_pong.canvas.width = 1920;
  ctx_pong.canvas.height = 200;
  ctx_pong.imageSmoothingEnabled = true;

  const statsCanvas = new StatsCanvas(ctx_race, ctx_pong);
  statsCanvas.raf = window.requestAnimationFrame(statsCanvas.loop.bind(this));
  statsCanvas.loop();
}
