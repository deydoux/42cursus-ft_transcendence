import Match, {Player} from '#lib/Match';
import {FastifyInstance} from 'fastify';

const RACE_TIMEOUT = 30 * 1000; // 30 seconds

export default class RaceMatch extends Match {
  private raceTimeout?: NodeJS.Timeout;

  constructor(server: FastifyInstance, players: [Player, Player]) {
    super(server, players, 'race');
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

  public async start() {
    this.raceTimeout = setTimeout(() => this.handleEnd(), RACE_TIMEOUT);
    return super.start();
  }
}
