import {FastifyInstance} from 'fastify';
import {Participant} from '#lib/Tournament';
import PongMatch from '#lib/PongMatch';

export default class Round {
  private server;
  private rounds: Round[] = [];
  private participants: Participant[] = [];

  constructor(server: FastifyInstance, size: number) {
    this.server = server;

    const half = size / 2;
    if (half > 2)
      for (let i = 0; i < 2; i++) this.rounds.push(new Round(server, half));
  }

  public addParticipant(participant: Participant) {
    this.participants.push(participant);
  }

  public get firstRounds(): Round[] {
    if (this.rounds) return this.rounds.map(round => round.firstRounds).flat();
    return [this];
  }

  public async start() {
    for (const round of this.rounds || []) {
      const result = await round.start();
      if (result.winner) this.participants.push(result.winner);
    }

    if (this.participants.length < 2)
      return {winner: this.participants[0], result: 'empty'};

    const match = new PongMatch(this.server, [
      this.participants[0],
      this.participants[1],
    ]);
    return await match.start();
  }
}
