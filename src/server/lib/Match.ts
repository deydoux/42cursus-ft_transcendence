import {Client} from '#types/Clients';
import Clients from '#lib/Clients';
import {FastifyInstance} from 'fastify';
import SQL from 'sql-template-strings';

export interface Player extends Client {
  elo?: number;
  score?: number;
}

export default abstract class Match {
  protected server;
  protected players;
  protected game;
  protected ranked;

  protected draw = false;
  protected winner?: Player;

  private readonly createdAt = Math.floor(Date.now() / 1000);

  constructor(
    server: FastifyInstance,
    players: [Player, Player],
    game: string,
    ranked: boolean,
  ) {
    this.server = server;
    this.players = players;
    this.game = game;
    this.ranked = ranked;

    for (const [index, player] of this.players.entries()) {
      player.score = 0;
      const opponent = this.players[1 - index];

      player.socket.on('close', () => this.handleClose(opponent));
      player.socket.on('error', () => this.handleClose(opponent));
      player.socket.on('message', data => {
        let message;
        try {
          message = JSON.parse(data.toString());
        } catch {
          return player.socket.send(
            Clients.message({type: 'error', message: 'Invalid JSON'}),
          );
        }

        this.handleMessage(player, message);
      });

      server.game.players[player.userID] = opponent.userID;
    }
  }

  private async destroy(winner: Player) {
    const mode = this.ranked ? 'ranked' : 'casual';
    const looser =
      winner.userID === this.players[0].userID
        ? this.players[1]
        : this.players[0];

    const {lastID: id} = await this.server.db.run(SQL`
      INSERT INTO matches(game, mode, winner_id, looser_id, winner_score,
                         looser_score, draw, created_at)
      VALUES(${this.game}, ${mode}, ${winner.userID}, ${looser.userID},
            ${winner.score}, ${looser.score}, ${this.draw}, ${this.createdAt})
    `);
    if (!id) throw new Error('Failed to create match');

    if (this.ranked) await this.destroyRanked(id, winner, looser);

    delete this.server.game.players[winner.userID];
    delete this.server.game.players[looser.userID];
  }

  private async destroyRanked(id: number, winner: Player, looser: Player) {
    if (!winner.elo || !looser.elo) throw new Error('Elo not found');

    const rate = 1 / (1 + Math.pow(10, (winner.elo - looser.elo) / 400));
    const kFactor = 32;
    const change = Math.round(kFactor * rate);

    await this.server.db.run(SQL`
      INSERT INTO elo(game, user_id, value)
      VALUES(${this.game}, ${winner.userID}, ${winner.elo + change}),
            (${this.game}, ${looser.userID}, ${looser.elo - change})
    `);

    await this.server.db.run(SQL`
      INSERT INTO ranked_matches(id, winner_elo, looser_elo, elo_change)
      VALUES(${id}, ${winner.elo}, ${looser.elo}, ${change})
    `);
  }

  public error() {
    this.players.forEach(player =>
      player.socket.send(
        Clients.message({type: 'error', message: 'Match error'}),
      ),
    );
  }

  public async fetchElo() {
    for (const player of this.players) {
      const elo = await this.server.db.get(SQL`
        SELECT value
        FROM elo
        WHERE game = ${this.game} AND user_id = ${player.userID}
        ORDER BY created_at DESC
        LIMIT 1
      `);

      if (!elo) throw new Error('Elo not found');
      player.elo = elo.value;
    }
  }

  private handleClose(opponent: Player) {
    this.draw = true;
    this.winner = opponent;

    this.server.log.warn(
      'TODO: Send system message to players about disconnect',
    );
  }

  private handleMessage(player: Player, message: Record<string, unknown>) {
    if (message?.type === 'move') this.handleMove(player, message);
  }

  protected abstract handleMove(player: Player, message: object): void;

  public async start() {
    if (this.ranked) await this.fetchElo();
    while (!this.winner) await this.tick();
    await this.destroy(this.winner);
  }

  protected abstract tick(): Promise<void>;
}
