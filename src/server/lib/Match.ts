import {Client, ClientTunnelMessage, ServerTunnelMessage} from '#types/Clients';
import Clients from '#lib/Clients';
import {Data} from 'ws';
import {FastifyInstance} from 'fastify';
import SQL from 'sql-template-strings';

export interface Player extends Client {
  username: string;
  avatar: string;
  score: number;
  elo?: number;
}

export const kFactor = 32;

const SCORE_TIMEOUT = 1000;

export default abstract class Match {
  private server;
  private _game;
  private ranked;
  private tournament;

  private block = false;
  private scoring?: {
    fromPlayerID: number;
    scorerID: number;
    timeout: NodeJS.Timeout;
  };

  private readonly createdAt = Math.floor(Date.now() / 1000);
  private readonly lock;

  protected players;
  protected result?: 'cancel' | 'forfeit' | 'tie';
  protected unlock = () => undefined;
  protected winner?: Player;

  constructor(
    server: FastifyInstance,
    players: [Player, Player],
    game: 'pong' | 'race',
  ) {
    this.server = server;
    this.players = players;
    this._game = game;
    this.ranked = players.every(player => player.elo);
    this.tournament = players.every(
      player =>
        this.server.game.players[player.userID]?.match?.game === 'tournament',
    );

    this.lock = new Promise(resolve => {
      this.unlock = () => void resolve(undefined);
    });

    this.execute((player, opponent) => {
      player.score = 0;

      const onSocketClose = () => this.forfeits(opponent);
      const onSocketMessage = this.handleMessage(player, opponent);

      player.socket.on('close', onSocketClose);
      player.socket.on('error', onSocketClose);
      player.socket.on('message', onSocketMessage);

      this.lock.then(() => {
        player.socket.off('close', onSocketClose);
        player.socket.off('error', onSocketClose);
        player.socket.off('message', onSocketMessage);
      });

      if (!this.tournament)
        server.game.players[player.userID] = {
          match: this,
          opponent: opponent.userID,
        };
    });
  }

  private cancel(cause?: string) {
    this.send({type: 'matchCancel', cause});
    this.result = 'cancel';
    this.unlock();
  }

  protected async destroy(winner?: Player) {
    if (this.scoring) clearTimeout(this.scoring.timeout);
    if (!this.tournament)
      this.execute(player => delete this.server.game.players[player.userID]);

    if (!winner) return;

    const mode = this.ranked ? 'ranked' : 'casual';
    const loser =
      winner.userID === this.players[0].userID
        ? this.players[1]
        : this.players[0];

    const {lastID: id} = await this.server.db.run(SQL`
      INSERT INTO matches(game, mode, winner_id, loser_id, winner_score,
                         loser_score, result, created_at)
      VALUES(${this._game}, ${mode}, ${winner.userID}, ${loser.userID},
            ${winner.score}, ${loser.score}, ${this.result}, ${this.createdAt})
    `);
    if (!id) throw new Error('Failed to create match');

    if (this.ranked) await this.destroyRanked(id, winner, loser);
    else
      this.send({
        type: 'matchEnd',
        winner: winner.userID,
        result: this.result,
      });
  }

  private async destroyRanked(id: number, winner: Player, loser: Player) {
    if (!winner.elo || !loser.elo) throw new Error('Elo not found');

    let change = 0;
    if (this.result !== 'tie') {
      const rate = 1 / (1 + Math.pow(10, (winner.elo - loser.elo) / 400));
      change = Math.round(kFactor * rate);
    }

    await this.server.db.run(SQL`
      INSERT INTO elo(game, user_id, value)
      VALUES(${this._game}, ${winner.userID}, ${winner.elo + change}),
            (${this._game}, ${loser.userID}, ${loser.elo - change})
    `);

    await this.server.db.run(SQL`
      INSERT INTO ranked_matches(id, winner_elo, loser_elo, elo_change)
      VALUES(${id}, ${winner.elo}, ${loser.elo}, ${change})
    `);

    this.send({
      type: 'matchEnd',
      winner: winner.userID,
      result: this.result,
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

  public get game() {
    return this._game;
  }

  protected static generateAngle() {
    return (
      Math.random() * (Math.PI / 3) +
      Math.round(Math.random() * 3) * (Math.PI / 2)
    );
  }

  private forfeits(winner: Player) {
    this.result = 'forfeit';
    this.winner = winner;
    this.unlock();
  }

  private handleMessage =
    (player: Player, opponent: Player) => (data: Data) => {
      let message;
      try {
        message = JSON.parse(data.toString());
      } catch {
        return;
      }

      switch (message?.type) {
        case 'leaveMatchmaking':
        case 'leaveTournament':
          this.forfeits(opponent);
          break;
        case 'move':
          Clients.sendClient(opponent, message as ServerTunnelMessage);
          break;
        case 'score':
          this.handleScore(
            player,
            message as ClientTunnelMessage & {type: 'score'},
          );
          break;
      }
    };

  protected abstract handleRound(scorer: Player): void;

  private handleScore(
    player: Player,
    message: ClientTunnelMessage & {type: 'score'},
  ) {
    if (!this.players.some(player => player.userID === message.scorerID))
      return Clients.sendClient(player, {
        type: 'error',
        message: 'Invalid scorer ID',
      });

    if (!this.scoring) {
      this.scoring = {
        fromPlayerID: player.userID,
        scorerID: message.scorerID,
        timeout: this.scoreTimeout(),
      };

      return;
    }

    if (
      this.scoring.fromPlayerID === player.userID ||
      this.scoring.scorerID !== message.scorerID
    )
      return this.cancel('Clients synchronization lost');

    const scorer = this.players.find(
      player => player.userID === this.scoring?.scorerID,
    ) as Player;

    clearTimeout(this.scoring.timeout);
    this.scoring = undefined;

    scorer.score++;

    this.handleRound(scorer);
  }

  private scoreTimeout() {
    return setTimeout(
      () => this.cancel('Clients synchronization lost'),
      SCORE_TIMEOUT,
    );
  }

  protected send(message: ServerTunnelMessage) {
    return this.players.forEach(player => Clients.sendClient(player, message));
  }

  public async start() {
    const userIDs = this.players.map(player => player.userID);
    const relationship = await this.server.db.get(SQL`
      SELECT NULL
      FROM relationships
      WHERE type = 'block' AND (
              (user_id = ${userIDs[0]} AND other_id = ${userIDs[1]})
              OR (user_id = ${userIDs[1]} AND other_id = ${userIDs[0]})
            )
    `);

    if (relationship) this.block = true;

    const angle = Match.generateAngle();

    this.send({
      type: 'matchStart',
      game: this._game,
      ranked: this.ranked,
      block: this.block,
      players: this.players.map(player => ({
        id: player.userID,
        username: player.username,
        avatar: player.avatar,
        elo: player.elo,
      })),
      dx: Math.cos(angle),
      dy: Math.sin(angle),
      time: Date.now() + 1000,
    });

    await this.lock;
    await this.destroy(this.winner);

    return {winner: this.winner, result: this.result};
  }
}
