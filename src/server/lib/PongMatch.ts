import Match, {Player} from '#lib/Match';
import {FastifyInstance} from 'fastify';

const SCORE_GOAL = 3;

export default class PongMatch extends Match {
  constructor(server: FastifyInstance, players: [Player, Player]) {
    super(server, players, 'pong');
  }

  protected handleRound(scorer: Player) {
    if ((scorer.score || 0) >= SCORE_GOAL) {
      this.winner = scorer;
      return this.unlock();
    }

    this.send({type: 'round'});
  }
}
