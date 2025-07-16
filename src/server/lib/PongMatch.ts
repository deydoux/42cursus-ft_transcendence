import Match, {Player} from '#lib/Match';
import {Client} from '#types/Clients';
import {FastifyInstance} from 'fastify';

// TODO: Remove debug sleep
const sleep = (seconds: number): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, seconds * 1000));

export default class PongMatch extends Match {
  constructor(
    server: FastifyInstance,
    players: [Client, Client],
    ranked: boolean,
  ) {
    super(server, players, 'pong', ranked);
  }

  protected handleMove(player: Player, message: object) {
    this.server.log.warn('TODO: Handle player move in Pong');
  }

  protected async tick() {
    await sleep(1);
    this.server.log.warn('TODO: Implement game logic for Pong');
  }
}
