import {Client, ServerTunnelMessage} from '#types/Clients';
import Clients from '#lib/Clients';
import {FastifyInstance} from 'fastify';

export class Tournament {
  public readonly game = 'tournament';

  private readonly server: FastifyInstance;
  private readonly id;
  private readonly name;

  private participants: Client[] = [];

  constructor(
    server: FastifyInstance,
    id: number,
    name: string,
    owner: Client,
  ) {
    this.server = server;
    this.id = id;
    this.name = name;
    this.addParticipant(owner, true);
  }

  public addParticipant(client: Client, isOwner = false) {
    if (!isOwner)
      try {
        this.server.playAvailability(client);
      } catch {
        return;
      }

    this.participants.push(client);
  }

  private sendSocket(socket: WebSocket, message: ServerTunnelMessage) {
    return socket.send(Clients.message(message));
  }
}
