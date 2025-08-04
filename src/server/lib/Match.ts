import {Client, ServerTunnelMessage} from '#types/Clients';
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

export default abstract class Match {
  protected server;
  protected players;
  protected game;
  protected ranked;

  private unlock = () => undefined;
  protected draw = false;
  protected winner?: Player;

  private readonly createdAt = Math.floor(Date.now() / 1000);
  private readonly lock;

  constructor(
    server: FastifyInstance,
    players: [Player, Player],
    game: string,
  ) {
    this.server = server;
    this.players = players;
    this.game = game;
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

        this.handleMessage(player, message);
      });

      server.game.players[player.userID] = opponent.userID;
    });
  }

  protected cancel(cause?: string) {
    this.execute(player =>
      this.sendSocket(player.socket, {type: 'matchCancel', cause}),
    );

    this.unlock();
  }

  private async destroy(winner?: Player) {
    if (!winner) return;

    const mode = this.ranked ? 'ranked' : 'casual';
    const loser =
      winner.userID === this.players[0].userID
        ? this.players[1]
        : this.players[0];

    const {lastID: id} = await this.server.db.run(SQL`
      INSERT INTO matches(game, mode, winner_id, loser_id, winner_score,
                         loser_score, draw, created_at)
      VALUES(${this.game}, ${mode}, ${winner.userID}, ${loser.userID},
            ${winner.score}, ${loser.score}, ${this.draw}, ${this.createdAt})
    `);
    if (!id) throw new Error('Failed to create match');

    if (this.ranked) await this.destroyRanked(id, winner, loser);
    else
      this.execute(player =>
        this.sendSocket(player.socket, {
          type: 'matchEnd',
          winner: winner.userID,
          loser: loser.userID,
          draw: this.draw,
        }),
      );

    delete this.server.game.players[winner.userID];
    delete this.server.game.players[loser.userID];
  }

  private async destroyRanked(id: number, winner: Player, loser: Player) {
    if (!winner.elo || !loser.elo) throw new Error('Elo not found');

    const rate = 1 / (1 + Math.pow(10, (winner.elo - loser.elo) / 400));
    const change = Math.round(kFactor * rate);

    await this.server.db.run(SQL`
      INSERT INTO elo(game, user_id, value)
      VALUES(${this.game}, ${winner.userID}, ${winner.elo + change}),
            (${this.game}, ${loser.userID}, ${loser.elo - change})
    `);

    await this.server.db.run(SQL`
      INSERT INTO ranked_matches(id, winner_elo, loser_elo, elo_change)
      VALUES(${id}, ${winner.elo}, ${loser.elo}, ${change})
    `);

    this.execute(player =>
      this.sendSocket(player.socket, {
        type: 'matchEnd',
        winner: winner.userID,
        loser: loser.userID,
        draw: this.draw,
        eloChange: change,
      }),
    );
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

  private handleMessage(player: Player, message: Record<string, unknown>) {
    if (message?.type === 'move') this.handleMove(player, message);
  }

  protected abstract handleMove(player: Player, message: object): void;

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

    await this.execute(async (player, opponent) =>
      this.sendSocket(player.socket, {
        type: 'matchStart',
        game: this.game,
        ranked: this.ranked,
        user: {
          id: player.userID,
          username: player.username,
          avatar: player.avatar,
          elo: player.elo,
        },
        opponent: {
          id: opponent.userID,
          username: opponent.username,
          avatar: opponent.avatar,
          elo: opponent.elo,
        },
      }),
    );

    await this.lock;
    await this.destroy(this.winner);

    return this.winner;
  }
}
