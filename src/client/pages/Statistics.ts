import {BaseComponent} from '../components/BaseComponent';
import {StatisticsData} from '../types/statistics';
import {StatisticsUI} from '../containers/statistics/statisticsUI';
import {statisticsApi} from '../api/statistics';

export class Statistics extends BaseComponent {
  private statisticsUI?: StatisticsUI;

  render(): HTMLElement {
    this.statisticsUI = new StatisticsUI();
    const container = this.statisticsUI.render();

    // Listen for refresh events
    document.addEventListener('refreshStatistics', () => {
      this.refreshStatistics();
    });

    // Load statistics data on render
    this.loadStatistics();

    return container;
  }

  private async loadStatistics(): Promise<void> {
    try {
      // First fetch the data from APIs and store in AppState
      await statisticsApi.getStreaks();
      await statisticsApi.getMatches();

      // Then transform and get the statistics
      const data: StatisticsData = await statisticsApi.getAllStatistics();

      // Update the UI with the data
      this.statisticsUI?.updateStatistics(data);
    } catch (error) {
      console.error('Failed to load statistics:', error);
    }
  }

  public async refreshStatistics(): Promise<void> {
    await this.loadStatistics();
  }

  public cleanup(): void {
    this.statisticsUI?.hide();
  }

  public destroy(): void {
    this.cleanup();
  }
}
