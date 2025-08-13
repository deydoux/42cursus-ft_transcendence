import {Client, ClientTunnelMessage, ServerTunnelMessage} from '#types/Clients';
import Clients from '#lib/Clients';
import {FastifyInstance} from 'fastify';
import SQL from 'sql-template-strings';
import {WebSocket} from '@fastify/websocket';
import serializeUserAvatar from './serializeUserAvatar';

export interface Player extends Client {
  username?: string;
  avatar?: string;
  elo?: number;
  score?: number;
}

export const kFactor = 32;

export default class Match {
  private server;
  private players;
  private ranked;

  private unlock = () => undefined;
  private draw = false;
  private winner?: Player;

  private readonly createdAt = Math.floor(Date.now() / 1000);
  private readonly lock;

  constructor(server: FastifyInstance, players: [Player, Player]) {
    this.server = server;
    this.players = players;
    this.ranked = players.every(player => player.elo);

    this.lock = new Promise(resolve => {
      this.unlock = () => void resolve(undefined);
    });

    this.execute((player, opponent) => {
      player.score = 0;

      player.socket.on('close', () => this.handleClose(opponent));
      player.socket.on('error', () => this.handleClose(opponent));
      player.socket.on('message', data => {
        let message;
        try {
          message = JSON.parse(data.toString());
        } catch {
          return this.sendSocket(player.socket, {
            type: 'error',
            message: 'Invalid JSON',
          });
        }

        this.handleMessage(player, opponent, message);
      });

      server.game.players[player.userID] = opponent.userID;
    });
  }

  private cancel(cause?: string) {
    this.send({type: 'matchCancel', cause});
    this.unlock();
  }

  private async destroy(winner?: Player) {
    this.execute(player => delete this.server.game.players[player.userID]);

    if (!winner) return;

    const mode = this.ranked ? 'ranked' : 'casual';
    const loser =
      winner.userID === this.players[0].userID
        ? this.players[1]
        : this.players[0];

    const {lastID: id} = await this.server.db.run(SQL`
      INSERT INTO matches(game, mode, winner_id, loser_id, winner_score,
                         loser_score, draw, created_at)
      VALUES('pong', ${mode}, ${winner.userID}, ${loser.userID},
            ${winner.score}, ${loser.score}, ${this.draw}, ${this.createdAt})
    `);
    if (!id) throw new Error('Failed to create match');

    if (this.ranked) await this.destroyRanked(id, winner, loser);
    else
      this.send({
        type: 'matchEnd',
        winner: winner.userID,
        draw: this.draw,
      });
  }

  private async destroyRanked(id: number, winner: Player, loser: Player) {
    if (!winner.elo || !loser.elo) throw new Error('Elo not found');

    const rate = 1 / (1 + Math.pow(10, (winner.elo - loser.elo) / 400));
    const change = Math.round(kFactor * rate);

    await this.server.db.run(SQL`
      INSERT INTO elo(game, user_id, value)
      VALUES('pong', ${winner.userID}, ${winner.elo + change}),
            ('pong', ${loser.userID}, ${loser.elo - change})
    `);

    await this.server.db.run(SQL`
      INSERT INTO ranked_matches(id, winner_elo, loser_elo, elo_change)
      VALUES(${id}, ${winner.elo}, ${loser.elo}, ${change})
    `);

    this.send({
      type: 'matchEnd',
      winner: winner.userID,
      draw: this.draw,
      eloChange: change,
    });
  }

  public error() {
    this.cancel('An error occurred during the match');
  }

  private async execute(action: (player: Player, opponent: Player) => unknown) {
    for (const [index, player] of this.players.entries()) {
      const opponent = this.players[1 - index];
      await action(player, opponent);
    }
  }

  public async fetchData() {
    for (const player of this.players) {
      const user = await this.server.db.get(SQL`
        SELECT id, username, has_avatar, avatar_version
        FROM users
        WHERE id = ${player.userID}
      `);

      serializeUserAvatar(user);
      player.username = user.username;
      player.avatar = user.avatar;

      if (!this.ranked) delete player.elo;
    }
  }

  private handleClose(opponent: Player) {
    this.draw = true;
    this.winner = opponent;
    this.unlock();
  }

  private handleMessage(
    player: Player,
    opponent: Player,
    message: Record<string, unknown>,
  ) {
    switch (message?.type) {
      case 'move':
      case 'gameMessage':
        this.sendSocket(opponent.socket, message as ServerTunnelMessage);
        break;
      case 'score':
        this.handleScore(
          player,
          opponent,
          message as ClientTunnelMessage & {type: 'score'},
        );
        break;
    }
  }

  private handleScore(
    player: Player,
    opponent: Player,
    message: ClientTunnelMessage & {type: 'score'},
  ) {
    if (!this.players.some(player => player.userID === message.player))
      return this.sendSocket(player.socket, {
        type: 'error',
        message: 'Invalid score message',
      });

    this.server.log.warn('TODO: Handle score message');
  }

  private send(message: ServerTunnelMessage) {
    return this.players.forEach(player =>
      player.socket.send(Clients.message(message)),
    );
  }

  private sendSocket(socket: WebSocket, message: ServerTunnelMessage) {
    return socket.send(Clients.message(message));
  }

  public async start() {
    await this.fetchData();

    this.send({
      type: 'matchStart',
      game: 'pong',
      ranked: this.ranked,
      players: this.players.map(player => ({
        id: player.userID,
        username: player.username,
        avatar: player.avatar,
        elo: player.elo,
      })),
    });

    await this.lock;
    await this.destroy(this.winner);

    return this.winner;
  }
}
