export interface StatisticsData {
  // General game stats
  totalGamesPlayed: number;
  totalWins: number;
  totalLosses: number;
  winRate: number;
  monthlyActivity: Record<string, number>; // Date string -> number of games
  gameModeDistribution: {
    pong: {casual: number; ranked: number};
    race: {casual: number; ranked: number};
  };
  // Pong-specific stats
  pongStats: {
    matches: {
      game: string;
      mode: string;
      result: string;
      createdAt: string;
      updatedAt: string;
      eloChange: number;
      winner: {
        id: number;
        username: string;
        avatar: string;
        score: number;
        elo: number;
      };
      loser: {
        id: number;
        username: string;
        avatar: string;
        score: number;
        elo: number;
      };
    }[];
    gamesPlayed: number;
    wins: number;
    losses: number;
    winRate: number;
    bestStreak: number;
    currentStreak: number;
    eloHistory: {value: number; createdAt: string}[];
    currentElo?: number;
  };

  // Race-specific stats
  raceStats: {
    matches: {
      game: string;
      mode: string;
      result: string;
      createdAt: string;
      updatedAt: string;
      eloChange: number;
      winner: {
        id: number;
        username: string;
        avatar: string;
        score: number;
        elo: number;
      };
      loser: {
        id: number;
        username: string;
        avatar: string;
        score: number;
        elo: number;
      };
    }[];
    gamesPlayed: number;
    wins: number;
    losses: number;
    winRate: number;
    bestStreak: number;
    currentStreak: number;
    eloHistory: {value: number; createdAt: string}[];
    currentElo?: number;
  };
}
