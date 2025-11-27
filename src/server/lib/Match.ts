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
let it = 0;

const COUNTDOWN_TIME = 4 * 1000; // 4 seconds
const SCORE_TIMEOUT = 1000; // 1 second

export default abstract class Match {
  private it = ++it;
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

  private readonly createdAt = Date.now();
  private readonly countdown = this.createdAt + COUNTDOWN_TIME;
  private readonly lock;

  protected readonly scorePoint: number = 1;

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
    this.send({type: 'matchCancel', it: this.it, cause});
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
            ${winner.score}, ${loser.score}, ${this.result},
            ${Math.floor(this.createdAt / 1000)})
    `);
    if (!id) throw new Error('Failed to create match');

    if (this.result !== 'tie') {
      await this.server.db.run(SQL`
        UPDATE streaks
        SET current = current + 1, best = MAX(best, current + 1)
        WHERE user_id = ${winner.userID} AND game = ${this._game}
              AND mode = ${mode}
      `);

      await this.server.db.run(SQL`
        UPDATE streaks
        SET current = 0
        WHERE user_id = ${loser.userID} AND game = ${this._game}
              AND mode = ${mode}
      `);
    }

    if (this.ranked) await this.destroyRanked(id, winner, loser);
    else
      this.send({
        type: 'matchEnd',
        it: this.it,
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
      it: this.it,
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

  private forfeits(winner: Player) {
    this.result = 'forfeit';
    this.winner = winner;

    const delay = this.countdown - Date.now();
    setTimeout(() => this.unlock(), delay > 0 ? delay : 0);
  }

  public get game() {
    return this._game;
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
        case 'ballState':
        case 'carGrowth':
        case 'carMove':
        case 'carSlowdown':
        case 'carStopped':
        case 'updateGrowth':
        case 'updateSlowDown':
        case 'paddleMove':
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

    scorer.score += this.scorePoint;

    this.handleRound(scorer);
  }

  protected initialState() {
    return {};
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

    this.send({
      type: 'matchStart',
      it: this.it,
      game: this._game,
      ranked: this.ranked,
      block: this.block,
      players: this.players.map(player => ({
        id: player.userID,
        username: player.username,
        avatar: player.avatar,
        elo: player.elo,
      })),
      time: this.countdown, // 4 seconds
      ...this.initialState(),
    });

    const tick = setInterval(() => this.send({type: 'matchTick'}), 750);
    await this.lock;

    clearInterval(tick);
    await this.destroy(this.winner);

    return {winner: this.winner, result: this.result};
  }
}
