import Match, {Player} from '#lib/Match';
import {FastifyInstance} from 'fastify';

const RACE_TIMEOUT = 2 * 60 * 1000 + 6 * 1000; // 2 minutes + 6 seconds
const BONUSES: ('growpoint' | 'slowpoint')[] = ['growpoint', 'slowpoint'];
const BONUS_INTERVAL = 20 * 1000; // 20 seconds
const CHECKPOINT_INTERVAL = 5 * 1000; // 5 seconds
const WIDTH = 1920;
const HEIGHT = 1080;

export default class RaceMatch extends Match {
  private checkpoints: {x: number; y: number}[] = [];
  private timeouts: NodeJS.Timeout[] = [];
  private walls = RaceMatch.generateWalls();

  protected readonly scorePoint = 2;

  constructor(server: FastifyInstance, players: [Player, Player]) {
    super(server, players, 'race');
  }

  private checkpointClose(x: number, y: number) {
    const minDistance = 200;

    return this.checkpoints.some(checkpoint => {
      const distance = Math.sqrt(
        Math.pow(x - checkpoint.x, 2) + Math.pow(y - checkpoint.y, 2),
      );
      return distance < minDistance;
    });
  }

  private createObject(object: 'checkpoint' | 'growpoint' | 'slowpoint') {
    const maxAttempts = 80;
    const padding = 30;
    let attempts = 0;
    let x, y;

    do {
      x = Math.random() * (WIDTH - padding * 2) + padding;
      y = Math.random() * (HEIGHT - padding * 2) + padding;
      attempts++;
    } while (
      (this.isColliding(x, y, padding) ||
        (object === 'checkpoint' && this.checkpointClose(x, y))) &&
      attempts < maxAttempts
    );

    if (object === 'checkpoint') {
      this.checkpoints.unshift({x, y});
      this.checkpoints = this.checkpoints.slice(0, 3);
    }

    this.send({
      type: 'raceObject',
      object,
      x,
      y,
    });
  }

  protected async destroy(winner?: Player) {
    this.timeouts.forEach(timeout => clearTimeout(timeout));
    return super.destroy(winner);
  }

  private bonusIndex = Math.floor(Math.random() * BONUSES.length);
  private generateBonuses() {
    this.createObject(BONUSES[this.bonusIndex++ % BONUSES.length]);
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
    return {
      time: Date.now() + 1000, // 1 second
      walls: this.walls,
    };
  }

  private isColliding(x: number, y: number, radius: number) {
    return this.walls.some(wall => {
      // Check if point (with radius) intersects with wall rectangle
      const distX = Math.abs(x - (wall.x + wall.width / 2));
      const distY = Math.abs(y - (wall.y + wall.height / 2));

      if (distX > wall.width / 2 + radius) return false;
      if (distY > wall.height / 2 + radius) return false;
      if (distX <= wall.width / 2) return true;
      if (distY <= wall.height / 2) return true;

      // Check corner collision
      const dx = distX - wall.width / 2;
      const dy = distY - wall.height / 2;
      return dx * dx + dy * dy <= radius * radius;
    });
  }

  public async start() {
    this.createObject('checkpoint');
    this.generateBonuses();

    this.timeouts.push(
      setTimeout(() => this.handleEnd(), RACE_TIMEOUT),
      setInterval(() => this.generateBonuses(), BONUS_INTERVAL),
      setInterval(() => this.createObject('checkpoint'), CHECKPOINT_INTERVAL),
    );
    return super.start();
  }
}
