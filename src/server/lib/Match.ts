import {Client} from '#types/Clients';
import {FastifyInstance} from 'fastify';

export interface Player extends Client {
  score?: number;
}

export default abstract class Match {
  protected server: FastifyInstance;
  protected players: Player[];

  protected type = 'pong';
  protected mode = 'casual';

  protected draw = false;
  protected finish = false;
  protected winner?: Player;

  constructor(server: FastifyInstance, player1: Client, player2: Client) {
    this.server = server;
    this.players = [player1, player2];

    for (const [index, player] of this.players.entries()) {
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

  protected destroy() {
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
    this.finish = true;
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

  public start() {
    while (!this.finish) this.tick();
    this.destroy();
  }

  protected abstract tick(): void;
}
