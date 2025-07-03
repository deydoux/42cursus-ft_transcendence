import {Client} from '#types/Clients';
import {FastifyInstance} from 'fastify';

export default class Match {
  protected server: FastifyInstance;
  protected player1: Client;
  protected player2: Client;

  constructor(server: FastifyInstance, player1: Client, player2: Client) {
    this.server = server;
    this.player1 = player1;
    this.player2 = player2;

    this.player1.socket.on('close', () =>
      this.handleSocketClose(this.player1, this.player2),
    );
    this.player2.socket.on('close', () =>
      this.handleSocketClose(this.player2, this.player1),
    );
  }

  private handleSocketClose(player: Client, opponent: Client) {
    this.server.log.warn(
      `TODO: Handle player disconnection, player ${player.userID} draw, opponent ${opponent.userID} wins`,
    );
  }
}
