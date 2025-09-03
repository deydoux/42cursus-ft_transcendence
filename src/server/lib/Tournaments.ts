import {Client} from '#types/Clients';
import {FastifyInstance} from 'fastify';
import {Tournament} from '#lib/Tournament';

export default class Tournaments {
  private id = 0;
  private tournaments: Record<number, Readonly<Tournament>> = {};

  private server: FastifyInstance;

  constructor(server: FastifyInstance) {
    this.server = server;
  }

  public create(name: string, owner: Client) {
    try {
      this.server.playAvailability(owner);
    } catch {
      return;
    }

    this.id++;
    const tournament = new Tournament(this.server, this.id, name, owner);
    this.tournaments[this.id] = tournament;
  }

  public delete(id: number) {
    delete this.tournaments[id];
  }

  get _() {
    return Object.values(this.tournaments).map(tournament => ({
      id: tournament.id,
      name: tournament.name,
      owner: {id: tournament.owner.userID},
    }));
  }
}
