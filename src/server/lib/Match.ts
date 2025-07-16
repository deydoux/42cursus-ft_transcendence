import {Client} from '#types/Clients';
import {FastifyInstance} from 'fastify';
import SQL from 'sql-template-strings';

export interface Player extends Client {
  score?: number;
}

export default abstract class Match {
  protected server;
  protected players;
  protected game;
  protected mode = 'casual';

  protected draw = false;
  protected winner?: Player;

  private readonly createdAt = Math.floor(Date.now() / 1000);

  constructor(
    server: FastifyInstance,
    players: [Player, Player],
    game: string,
  ) {
    this.server = server;
    this.players = players;
    this.game = game;

    for (const [index, player] of this.players.entries()) {
      player.score = 0;
      const opponent = this.players[1 - index];

      player.socket.on('close', () => this.handleClose(opponent));
      player.socket.on('error', () => this.handleClose(opponent));
      player.socket.on('message', message =>
        this.handleMessage(player, message),
      );

      server.game.players[player.userID] = opponent.userID;
    }
  }

  protected async destroy(winner: Player) {
    const looser =
      winner.userID === this.players[0].userID
        ? this.players[1]
        : this.players[0];

    await this.server.db.run(SQL`
      INSERT INTO matches(game, mode, winner_id, looser_id, winner_score,
                         looser_score, draw, created_at)
      VALUES(${this.game}, ${this.mode}, ${winner.userID}, ${looser.userID},
            ${winner.score}, ${looser.score}, ${this.draw}, ${this.createdAt})
    `);

    delete this.server.game.players[winner.userID];
    delete this.server.game.players[looser.userID];
  }

  private handleClose(opponent: Player) {
    this.draw = true;
    this.winner = opponent;

    this.server.log.warn(
      'TODO: Send system message to players about disconnect',
    );
  }

  private handleMessage(player: Player, message: object) {
    if ((message as {type: string}).type === 'move')
      this.handleMove(player, message);
  }

  protected abstract handleMove(player: Player, message: object): void;

  public async start() {
    while (!this.winner) await this.tick();
    await this.destroy(this.winner);
  }

  protected abstract tick(): Promise<void>;
}
