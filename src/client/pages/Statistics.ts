import {BaseComponent} from '../components/BaseComponent.ts';
import {Chat} from '../containers/chat/Chat.ts';
import {DOMUtils} from '../utils/dom.ts';
import {StatisticsUI} from '../containers/statistics/statisticsUI.ts';

export class Statistics extends BaseComponent {
  private statisticsUI: StatisticsUI;

  constructor() {
    super();
    this.statisticsUI = new StatisticsUI();
  }

  render(): HTMLElement {
    const container = DOMUtils.createElement('div', {
      className: 'w-screen h-screen flex items-center gap-10 py-16',
    });

    const statistics = DOMUtils.createElement('div', {
      className: 'h-full flex-1 flex flex-wrap gap-10',
    });

    // Add the StatisticsUI container
    const statsContainer = this.statisticsUI.render();
    if (statsContainer) {
      statistics.appendChild(statsContainer);
    }

    container.appendChild(statistics);

    // Add chat
    const chat = new Chat().render();
    if (chat) container.appendChild(chat);

    return container;
  }

  // Clean up when component is destroyed
  destroy(): void {
    this.statisticsUI.hide();
  }
}
