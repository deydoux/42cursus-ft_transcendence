import {Client} from '#types/Clients';
import {FastifyInstance} from 'fastify';

export interface Player extends Client {
  score?: number;
}

export default abstract class Match {
  protected server: FastifyInstance;
  protected player1: Player;
  protected player2: Player;

  protected type = 'pong';
  protected mode = 'casual';

  protected draw = false;
  protected finish = false;
  protected winner?: Player;

  constructor(server: FastifyInstance, player1: Client, player2: Client) {
    this.server = server;
    this.player1 = player1;
    this.player2 = player2;

    this.player1.score = 0;
    this.player2.score = 0;

    this.player1.socket.on('close', () =>
      this.handleDisconnect(this.player1, this.player2),
    );
    this.player2.socket.on('close', () =>
      this.handleDisconnect(this.player2, this.player1),
    );

    [this.player1, this.player2].forEach(player => {
      player.socket.on('message', message =>
        this.handleMessage(player, message),
      );

      server.game.players.push(player.userID);
    });

    server.game.matches.push(this);
  }

  protected destroy() {
    this.server.game.matches = this.server.game.matches.filter(
      match => match !== this,
    );

    this.server.game.players = this.server.game.players.filter(
      id => id !== this.player1.userID && id !== this.player2.userID,
    );
  }

  public getOpponent(id: number) {
    return id === this.player1.userID ? this.player2 : this.player1;
  }

  private handleDisconnect(player: Player, opponent: Player) {
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
