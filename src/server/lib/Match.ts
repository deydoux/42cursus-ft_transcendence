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
      this.server.log.warn(
        'TODO: Handle player1 disconnection, player1 draw, player2 wins',
      ),
    );

    this.player2.socket.on('close', () =>
      this.server.log.warn(
        'TODO: Handle player2 disconnection, player2 draw, player1 wins',
      ),
    );
  }
}
