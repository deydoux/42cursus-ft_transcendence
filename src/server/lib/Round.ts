import {Participant, Tournament} from '#lib/Tournament';
import {FastifyInstance} from 'fastify';
import PongMatch from '#lib/PongMatch';

export default class Round {
  private server;
  private tournament;
  private rounds: Round[] = [];
  private _participants: Participant[] = [];

  constructor(server: FastifyInstance, tournament: Tournament, size: number) {
    this.server = server;
    this.tournament = tournament;

    const half = size / 2;
    if (half > 1)
      for (let i = 0; i < 2; i++)
        this.rounds.push(new Round(server, tournament, half));
  }

  public addParticipant(participant: Participant) {
    this._participants.push(participant);
  }

  public get firstRounds(): Round[] {
    if (this.rounds.length)
      return this.rounds.map(round => round.firstRounds).flat();
    return [this];
  }

  public get participants() {
    return [...this._participants];
  }

  public async start() {
    for (const round of this.rounds || []) {
      const result = await round.start();
      if (result.winner) this._participants.push(result.winner);
    }

    if (this._participants.length < 2)
      return {winner: this._participants[0], result: 'empty'};

    const match = new PongMatch(this.server, [
      this._participants[0],
      this._participants[1],
    ]);

    this.tournament.send({
      type: 'tournamentMatchStart',
      participants: this._participants.map(participant => ({
        id: participant.userID,
        username: participant.username,
        avatar: participant.avatar,
      })),
    });

    const result = await match.start();

    this.tournament.send({
      type: 'tournamentMatchEnd',
      winner: result.winner
        ? {
            id: result.winner.userID,
            username: result.winner.username,
            avatar: result.winner.avatar,
          }
        : undefined,
      result: result.result,
    });

    return result;
  }
}
