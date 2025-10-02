import Match, {Player} from '#lib/Match';
import {FastifyInstance} from 'fastify';

const SCORE_GOAL = 3;

export default class PongMatch extends Match {
  constructor(server: FastifyInstance, players: [Player, Player]) {
    super(server, players, 'pong');
  }

  protected handleRound(scorer: Player) {
    if (scorer.score >= SCORE_GOAL) {
      this.winner = scorer;
      return this.unlock();
    }

    const angle = Match.generateAngle();

    this.send({
      type: 'round',
      dx: Math.cos(angle),
      dy: Math.sin(angle),
      time: Date.now() + 1000,
    });
  }
}
