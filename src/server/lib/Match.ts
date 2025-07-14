import {Client} from '#types/Clients';
import {FastifyInstance} from 'fastify';

export default class Match {
  private server: FastifyInstance;
  private player1: Client;
  private player2: Client;

  constructor(server: FastifyInstance, player1: Client, player2: Client) {
    this.server = server;
    this.player1 = player1;
    this.player2 = player2;

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

  private destroy() {
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

  private handleDisconnect(player: Client, opponent: Client) {
    this.server.log.warn(
      `TODO: Handle player disconnection, player ${player.userID} draw, opponent ${opponent.userID} wins`,
    );
  }

  private handleMessage(player: Client, message: object) {
    this.server.log.warn(
      `TODO: Handle message from player ${player.userID}: ${message}`,
    );
  }

  public start() {
    this.destroy();
  }
}
