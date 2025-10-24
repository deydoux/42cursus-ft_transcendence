export interface StatisticsData {
  // General game stats
  totalGamesPlayed: number;
  totalWins: number;
  totalLosses: number;
  winRate: number;

  // Pong-specific stats
  pongStats: {
    gamesPlayed: number;
    wins: number;
    losses: number;
    winRate: number;
    bestStreak: number;
    totalPoints: number;
  };

  // Race-specific stats
  raceStats: {
    racesFinished: number;
    wins: number;
    losses: number;
    winRate: number;
    bestStreak: number;
    totalPoints: number;
  };
}
