import Match, {Player} from '#lib/Match';
import {FastifyInstance} from 'fastify';

export default class PongMatch extends Match {
  constructor(server: FastifyInstance, players: [Player, Player]) {
    super(server, players, 'pong');
  }

  protected handleMove(player: Player, message: object) {
    this.server.log.warn('TODO: Handle player move in Pong');
  }
}
