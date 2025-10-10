import Match, {Player} from '#lib/Match';
import {FastifyInstance} from 'fastify';

const RACE_TIMEOUT = 30 * 1000; // 30 seconds
const WIDTH = 1920;
const HEIGHT = 1080;

export default class RaceMatch extends Match {
  private raceTimeout?: NodeJS.Timeout;
  private walls = RaceMatch.generateWalls();

  constructor(server: FastifyInstance, players: [Player, Player]) {
    super(server, players, 'race');
  }

  private static generateWalls() {
    const gridSpacing = HEIGHT / 9;
    const wallThickness = 8;
    const wallCount = 20;

    const verticalLines = Math.floor(WIDTH / gridSpacing);
    const horizontalLines = Math.floor(HEIGHT / gridSpacing);

    const verticalWall = [];
    const horizontalWall = [];

    // Generate vertical walls (along vertical grid lines)
    for (let i = 1; i < verticalLines; i++) {
      // Skip first and last lines
      const x = i * gridSpacing - wallThickness / 2;
      for (let j = 1; j < horizontalLines; j++) {
        const y = j * gridSpacing;
        verticalWall.push({
          x,
          y,
          width: wallThickness,
          height: gridSpacing,
        });
      }
    }

    // Generate horizontal walls (along horizontal grid lines)
    for (let j = 1; j < horizontalLines; j++) {
      // Skip first and last lines
      const y = j * gridSpacing - wallThickness / 2;
      for (let i = 1; i < verticalLines; i++) {
        const x = i * gridSpacing;
        horizontalWall.push({
          x,
          y,
          width: gridSpacing,
          height: wallThickness,
        });
      }
    }

    const walls = [...verticalWall, ...horizontalWall]
      .sort(() => Math.random() - 0.5)
      .slice(0, wallCount);

    return walls;
  }

  protected handleRound(scorer: Player) {
    void scorer;
  }

  protected async destroy(winner?: Player) {
    if (this.raceTimeout) clearTimeout(this.raceTimeout);
    return super.destroy(winner);
  }

  private handleEnd() {
    if (this.players[0].score === this.players[1].score) {
      this.result = 'tie';
      this.winner = this.players[0];
    } else
      this.winner =
        this.players[0].score > this.players[1].score
          ? this.players[0]
          : this.players[1];

    return this.unlock();
  }

  protected initialState() {
    return {};
  }

  public async start() {
    this.raceTimeout = setTimeout(() => this.handleEnd(), RACE_TIMEOUT);
    return super.start();
  }
}
