import Match, {Player} from '#lib/Match';
import {FastifyInstance} from 'fastify';

export default class PongMatch extends Match {
  constructor(server: FastifyInstance, players: [Player, Player]) {
    super(server, players, 'race');
  }

  protected handleRound(scorer: Player) {
    void scorer;
  }

  public async start() {
    // TODO: Race timeout

    return super.start();
  }
}
