import {Client, ServerTunnelMessage} from '#types/Clients';
import Clients from '#lib/Clients';
import {FastifyInstance} from 'fastify';

export class Tournament {
  public readonly game = 'tournament';

  private readonly id;
  private readonly name;

  private participants: Client[] = [];

  constructor(
    server: FastifyInstance,
    id: number,
    name: string,
    owner: Client,
  ) {
    this.id = id;
    this.name = name;
    this.addParticipant(owner);
  }

  public addParticipant(client: Client) {
    // TODO: check if already in game/tournament
    this.participants.push(client);
  }

  private sendSocket(socket: WebSocket, message: ServerTunnelMessage) {
    return socket.send(Clients.message(message));
  }
}
