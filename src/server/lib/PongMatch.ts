import Match, {Player} from '#lib/Match';
import {FastifyInstance} from 'fastify';

const SCORE_GOAL = 3;

export default class PongMatch extends Match {
  constructor(server: FastifyInstance, players: [Player, Player]) {
    super(server, players, 'pong');
  }

  private static generateAngle() {
    return (
      Math.random() * (Math.PI / 3) +
      Math.round(Math.random() * 3) * (Math.PI / 2)
    );
  }

  protected initialState() {
    const angle = PongMatch.generateAngle();

    return {
      dx: Math.cos(angle),
      dy: Math.sin(angle),
    };
  }

  protected handleRound(scorer: Player) {
    if (scorer.score >= SCORE_GOAL) {
      this.winner = scorer;
      return this.unlock();
    }

    this.send({
      type: 'round',
      time: Date.now() + 1000,
      ...this.initialState(),
    });
  }
}
