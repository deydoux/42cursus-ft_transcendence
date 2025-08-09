import '../styles/stats-page.css';
import {BaseComponent} from '../components/BaseComponent.ts';
import {DOMUtils} from '../utils/dom.ts';
import {StatsCanvas} from '../containers/statsCanvas.ts';
import {renderStats} from '../containers/renderStats.ts';

export class Statistics extends BaseComponent {
  private renderBandroll() {
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
    statsCanvas.raf = window.requestAnimationFrame(
      statsCanvas.loop.bind(statsCanvas),
    );
    statsCanvas.loop();
  }

  render(): HTMLElement | undefined {
    const container = DOMUtils.createElement('div', {
      className: 'w-screen h-screen flex items-center gap-10 py-16',
    });

    const statistics = DOMUtils.createElement('div', {
      className: 'h-full flex-1 flex flex-wrap gap-10',
    });
    statistics.appendChild(renderStats());
    const chat = DOMUtils.createElement('div', {
      className:
        'w-[400px] h-full flex-none border border-pink-300 rounded-3xl flex flex-col p-6',
    });

    this.renderBandroll();

    container.appendChild(statistics);
    container.appendChild(chat);
    return container;
  }
}
