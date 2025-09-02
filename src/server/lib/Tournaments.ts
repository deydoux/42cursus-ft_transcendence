import {Client} from '#types/Clients';
import {FastifyInstance} from 'fastify';
import {Tournament} from '#lib/Tournament';

export class Tournaments {
  private id = 0;
  private tournaments: Record<number, Tournament> = {};

  private server: FastifyInstance;

  constructor(server: FastifyInstance) {
    this.server = server;
  }

  create(name: string, owner: Client) {
    try {
      this.server.playAvailability(owner);
    } catch {
      return;
    }

    this.id++;
    const tournament = new Tournament(this.server, this.id, name, owner);
    this.tournaments[this.id] = tournament;
  }
}
