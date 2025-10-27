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
      console.log(elo);
      const pongMatches = matches.filter(match => match.game === 'pong');
      const raceMatches = matches.filter(match => match.game === 'race');
      const pongElo = elo.filter(elo => elo.game === 'pong');
      const raceElo = elo.filter(elo => elo.game === 'race');

      // Calculate user-specific stats from matches
      const userPongStats = this.calculateUserStats(pongMatches, user.id);
      const userRaceStats = this.calculateUserStats(raceMatches, user.id);

      // Transform to StatisticsData format
      const statisticsData: StatisticsData = {
        // General stats (calculated from all games)
        totalGamesPlayed: userPongStats.totalGames + userRaceStats.totalGames,
        totalWins: userPongStats.wins + userRaceStats.wins,
        totalLosses: userPongStats.losses + userRaceStats.losses,
        winRate: this.calculateOverallWinRate(
          userPongStats.wins + userRaceStats.wins,
          userPongStats.totalGames + userRaceStats.totalGames,
        ),

        // Pong-specific stats
        pongStats: {
          matches: pongMatches,
          gamesPlayed:
            streaks.pong.casual.totalMatches + streaks.pong.ranked.totalMatches,
          wins: userPongStats.wins,
          losses: userPongStats.losses,
          winRate: this.calculateGameWinRate(streaks.pong),
          bestStreak: Math.max(
            streaks.pong.casual.best,
            streaks.pong.ranked.best,
          ),
          currentStreak: Math.max(
            streaks.pong.casual.current,
            streaks.pong.ranked.current,
          ),
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
          gamesPlayed:
            streaks.race.casual.totalMatches + streaks.race.ranked.totalMatches,
          wins: userRaceStats.wins,
          losses: userRaceStats.losses,
          winRate: this.calculateGameWinRate(streaks.race),
          bestStreak: Math.max(
            streaks.race.casual.best,
            streaks.race.ranked.best,
          ),
          currentStreak: Math.max(
            streaks.race.casual.current,
            streaks.race.ranked.current,
          ),
          eloHistory: raceElo.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
          ), // Add this
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

  // Helper method to calculate user-specific stats from matches
  calculateUserStats(matches: AppState['matches'], userId: number) {
    let wins = 0;
    let losses = 0;
    let totalScore = 0;

    matches.forEach(match => {
      if (match.winner.id === userId) {
        wins++;
        totalScore += match.winner.score;
      } else if (match.loser.id === userId) {
        losses++;
        totalScore += match.loser.score;
      }
    });

    return {
      wins,
      losses,
      totalGames: wins + losses,
      totalScore,
    };
  },

  // Helper method to calculate win rate from streak data (convert 0-1 to percentage)
  calculateGameWinRate(gameStreaks: {
    casual: {winRate: number};
    ranked: {winRate: number};
  }): number {
    // Average the win rates from casual and ranked, convert to percentage
    const avgWinRate =
      (gameStreaks.casual.winRate + gameStreaks.ranked.winRate) / 2;
    return Math.round(avgWinRate * 100 * 10) / 10; // Round to 1 decimal place
  },

  // Helper method to calculate overall win rate
  calculateOverallWinRate(wins: number, totalGames: number): number {
    return totalGames > 0 ? Math.round((wins / totalGames) * 100 * 10) / 10 : 0;
  },
};
