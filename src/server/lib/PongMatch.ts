import Match, {Player} from '#lib/Match';
import {Client} from '#types/Clients';
import {FastifyInstance} from 'fastify';

// TODO: Remove
const sleep = (seconds: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
};

export default class PongMatch extends Match {
  constructor(server: FastifyInstance, players: [Client, Client]) {
    super(server, players, 'pong');
  }

  protected handleMove(player: Player, message: object) {
    this.server.log.warn('TODO: Handle player move in Pong');
  }

  protected async tick() {
    await sleep(1);
    this.server.log.warn('TODO: Implement game logic for Pong');

    // this.winner =
    //   this.players[0].userID < this.players[1].userID
    //     ? this.players[0]
    //     : this.players[1];
  }
}
