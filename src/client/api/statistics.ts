import {Api} from '../utils/Api';
import {AppState} from '../types';
import {StatisticsData} from '../types/statistics';
import {Store} from '../services/store';

const api = Api.getInstance();
const store = Store.getInstance();

export const statisticsApi = {
  // Get streak data for all games
  async getStreaks(): Promise<void> {
    const response = await api.get('statistics/streaks');
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }
    const data = await response.json();
    store.setState({streaks: data});
  },

  // Get match history for a specific game or all games
  async getMatches(): Promise<void> {
    const response = await api.get(`statistics/matches`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }
    const data = await response.json();
    store.setState({matches: data});
  },

  async getElo(): Promise<void> {
    const response = await api.get(`statistics/elo`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }
    const data = await response.json();
    store.setState({elo: data});
  },

  // Get all statistics and transform to StatisticsData format
  async getAllStatistics(): Promise<StatisticsData> {
    try {
      const {user} = Store.getInstance().getState();
      if (!user) {
        throw new Error('User not found in store');
      }

      const {streaks, matches, elo} = store.getState();
      const pongMatches = matches.filter(match => match.game === 'pong');
      const raceMatches = matches.filter(match => match.game === 'race');
      const pongElo = elo.filter(elo => elo.game === 'pong');
      const raceElo = elo.filter(elo => elo.game === 'race');

      const monthlyActivity = this.calculateMonthlyActivity(matches);
      console.log(matches);
      // Get game mode distribution from streaks
      const gameModeDistribution = {
        pong: {
          casual: this.calculateGameNumber(matches, user.id, 'pong').casual,
          ranked: this.calculateGameNumber(matches, user.id, 'pong').ranked,
        },
        race: {
          casual: this.calculateGameNumber(matches, user.id, 'race').casual,
          ranked: this.calculateGameNumber(matches, user.id, 'race').ranked,
        },
      };

      // Transform to StatisticsData format
      const statisticsData: StatisticsData = {
        // General stats (calculated from all games)
        totalGamesPlayed: streaks.total.totalMatches,
        totalWins: streaks.total.wins,
        totalLosses: streaks.total.losses,
        winRate: this.calculateGameWinRate(streaks.total.winRate),
        monthlyActivity,
        gameModeDistribution,

        // Pong-specific stats
        pongStats: {
          matches: pongMatches,
          gamesPlayed: streaks.pong.totalMatches,
          wins: streaks.pong.wins,
          losses: streaks.pong.losses,
          winRate: this.calculateGameWinRate(streaks.pong.winRate),
          casualCurrentStreak: streaks.pong.casual.current,
          casualBestStreak: streaks.pong.casual.best,
          rankedCurrentStreak: streaks.pong.ranked.current,
          rankedBestStreak: streaks.pong.ranked.best,
          eloHistory: pongElo.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          ),
          currentElo:
            pongElo.length > 0 ? pongElo[pongElo.length - 1].value : undefined,
        },

        // Race-specific stats
        raceStats: {
          matches: raceMatches,
          gamesPlayed: streaks.race.totalMatches,
          wins: streaks.race.wins,
          losses: streaks.race.losses,
          winRate: this.calculateGameWinRate(streaks.race.winRate),
          casualCurrentStreak: streaks.race.casual.current,
          casualBestStreak: streaks.race.casual.best,
          rankedCurrentStreak: streaks.race.ranked.current,
          rankedBestStreak: streaks.race.ranked.best,
          eloHistory: raceElo.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          ),
          currentElo:
            raceElo.length > 0 ? raceElo[raceElo.length - 1].value : undefined,
        },
      };

      return statisticsData;
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
      throw error;
    }
  },

  calculateGameNumber(
    matches: AppState['matches'],
    userId: number,
    game: string,
  ) {
    let casual = 0,
      ranked = 0;

    matches.forEach(match => {
      if (match.game === game) {
        if (match.mode == 'ranked') ranked++;
        if (match.mode == 'casual') casual++;
      }
    });
    return {casual, ranked};
  },

  calculateGameWinRate(winRate: number): number {
    return Math.round(winRate * 100 * 10) / 10; // Round to 1 decimal place
  },

  calculateMonthlyActivity(
    matches: AppState['matches'],
  ): Record<string, number> {
    const activity: Record<string, number> = {};

    matches.forEach(match => {
      const date = new Date(match.createdAt).toISOString().split('T')[0]; // YYYY-MM-DD format
      activity[date] = (activity[date] || 0) + 1;
    });

    return activity;
  },
};
