import {Client} from '#types/Clients';
import {FastifyInstance} from 'fastify';

export default class Match {
  private server: FastifyInstance;
  private player1: Client;
  private player2: Client;
  private type = 'casual';

  constructor(
    server: FastifyInstance,
    player1: Client,
    player2: Client,
    type?: string,
  ) {
    this.server = server;
    this.player1 = player1;
    this.player2 = player2;
    if (type) this.type = type;

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

      this.server.players.push(player.userID);
    });

    this.server.pong.matches.push(this);
  }

  private destroy() {
    this.server.pong.matches = this.server.pong.matches.filter(
      match => match !== this,
    );

    this.server.players = this.server.players.filter(
      id => id !== this.player1.userID && id !== this.player2.userID,
    );
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
