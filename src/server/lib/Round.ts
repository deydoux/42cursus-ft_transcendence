import {Participant, Tournament} from '#lib/Tournament';
import {FastifyInstance} from 'fastify';
import PongMatch from '#lib/PongMatch';

const DELAY = 5000; // 5s
let id = 0;

export default class Round {
  private server;
  private tournament;
  private nextRoundID;
  private _id = ++id;
  private rounds?: Round[];
  private _participants: Participant[] = [];

  constructor(
    server: FastifyInstance,
    tournament: Tournament,
    size: number,
    nextRoundID?: number,
  ) {
    this.server = server;
    this.tournament = tournament;
    this.nextRoundID = nextRoundID;

    const half = size / 2;
    if (half > 1) {
      this.rounds = [];
      for (let i = 0; i < 2; i++)
        this.rounds.push(new Round(server, tournament, half, this._id));
    }
  }

  public addParticipant(participant: Participant) {
    this._participants.push(participant);
  }

  public get firstRounds(): Round[] {
    if (this.rounds) return this.rounds.map(round => round.firstRounds).flat();
    return [this];
  }

  public get(): unknown {
    return {
      id: this._id,
      participants: this._participants.map(participant => ({
        id: participant.userID,
        username: participant.username,
        avatar: participant.avatar,
      })),
      rounds: this.rounds?.map(round => round.get()),
    };
  }

  public get id() {
    return this._id;
  }

  public get participants() {
    return [...this._participants];
  }

  private sendTournamentMatchEnd(
    winner?: Participant,
    result?: 'cancel' | 'empty' | 'forfeit' | 'tie',
  ) {
    this.tournament.send({
      type: 'tournamentMatchEnd',
      roundID: this.id,
      nextRoundID: this.nextRoundID,
      winner: winner
        ? {
            id: winner.userID,
            username: winner.username,
            avatar: winner.avatar,
          }
        : undefined,
      result: result,
    });
  }

  public async start() {
    const results = [];

    for (const round of this.rounds || []) {
      const result = round.start();
      results.push(result);
    }

    (await Promise.all(results)).forEach(result => {
      if (result.winner) this._participants.push(result.winner);
    });

    if (this._participants.length < 2) {
      this.sendTournamentMatchEnd(this._participants[0], 'empty');
      return {winner: this._participants[0], result: 'empty'};
    }

    const match = new PongMatch(this.server, [
      this._participants[0],
      this._participants[1],
    ]);

    this.tournament.send({
      type: 'tournamentMatchStart',
      roundID: this.id,
      participants: this._participants.map(participant => ({
        id: participant.userID,
        username: participant.username,
        avatar: participant.avatar,
      })),
    });

    await new Promise(resolve => setTimeout(resolve, DELAY));

    try {
      const result = await match.start();
      this.sendTournamentMatchEnd(result.winner, result.result);

      return result;
    } catch {
      match.error();
      this.sendTournamentMatchEnd(undefined, 'cancel');
      return {result: 'cancel'};
    }
  }
}
