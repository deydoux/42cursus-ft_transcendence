import Match, {Player} from '#lib/Match';
import {FastifyInstance} from 'fastify';

export default class PongMatch extends Match {
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

  public async start() {
    this.raceTimeout = setTimeout(() => {}, 10000);

    return super.start();
  }
}
