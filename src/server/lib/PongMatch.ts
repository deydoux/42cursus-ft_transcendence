import Match, {Player} from '#lib/Match';

export default class PongMatch extends Match {
  protected handleMove(player: Player, message: object) {
    this.server.log.warn('TODO: Handle player move in Pong');
  }

  protected tick() {
    this.server.log.warn('TODO: Implement game logic for Pong');
  }
}
