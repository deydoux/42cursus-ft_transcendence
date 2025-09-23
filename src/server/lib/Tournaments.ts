import Clients from '#lib/Clients';
import {FastifyInstance} from 'fastify';
import {Player} from '#lib/Match';
import {Tournament} from '#lib/Tournament';

export default class Tournaments {
  private id = 0;
  private tournaments: Record<number, Readonly<Tournament>> = {};

  private server: FastifyInstance;

  constructor(server: FastifyInstance) {
    this.server = server;
  }

  public create(name: string, owner: Player) {
    try {
      this.server.playAvailability(owner);
    } catch {
      return;
    }

    name = name.trim();
    if (name.length < 3 || name.length > 64)
      return Clients.sendClient(owner, {
        type: 'error',
        message: 'Tournament name must be between 3 and 64 characters',
      });

    this.id++;
    const tournament = new Tournament(this.server, this.id, name, owner);
    this.tournaments[this.id] = tournament;

    Clients.sendClient(owner, {
      type: 'success',
      origin: 'createTournament',
    });
  }

  public delete(id: number) {
    delete this.tournaments[id];
  }

  public get() {
    return Object.values(this.tournaments).map(tournament => ({
      id: tournament.id,
      name: tournament.name,
      participantCount: tournament.participantCount,
      owner: {id: tournament.owner.userID},
    }));
  }

  public join(id: number, participant: Player) {
    const tournament = this.tournaments[id];
    if (!tournament)
      return Clients.sendClient(participant, {
        type: 'error',
        message: 'Tournament not found',
      });

    tournament.addParticipant(participant);
  }
}
