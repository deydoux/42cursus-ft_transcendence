import {Client} from '#types/Clients';
import {FastifyInstance} from 'fastify';
import SQL from 'sql-template-strings';

export interface Player extends Client {
  score?: number;
}

export default abstract class Match {
  protected server;
  protected players;
  protected type;
  protected mode = 'casual';

  protected draw = false;
  protected winner?: Player;

  private readonly createdAt = Math.floor(Date.now() / 1000);

  constructor(
    server: FastifyInstance,
    players: [Player, Player],
    type: string,
  ) {
    this.server = server;
    this.players = players;
    this.type = type;

    for (const [index, player] of this.players.entries()) {
      player.score = 0;
      const opponent = this.players[1 - index];

      player.socket.on('close', () => this.handleClose(player, opponent));
      player.socket.on('error', () => this.handleClose(player, opponent));
      player.socket.on('message', message =>
        this.handleMessage(player, message),
      );

      server.game.players.push(player.userID);
    }

    server.game.matches.push(this);
  }

  protected async destroy(winner: Player) {
    const looser = this.getOpponent(winner.userID);

    await this.server.db.run(SQL`
      INSERT INTO matches(type, mode, winner_id, looser_id, winner_score,
                         looser_score, draw, created_at)
      VALUES(${this.type}, ${this.mode}, ${winner.userID}, ${looser.userID},
            ${winner.score}, ${looser.score}, ${this.draw}, ${this.createdAt})
    `);

    this.server.game.matches = this.server.game.matches.filter(
      match => match !== this,
    );

    this.server.game.players = this.server.game.players.filter(
      id => id !== this.players[0].userID && id !== this.players[1].userID,
    );
  }

  public getOpponent(id: number) {
    return id === this.players[0].userID ? this.players[1] : this.players[0];
  }

  private handleClose(player: Player, opponent: Player) {
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
