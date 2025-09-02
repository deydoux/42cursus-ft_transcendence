import {Client, ServerTunnelMessage} from '#types/Clients';
import Clients from '#lib/Clients';
import {FastifyInstance} from 'fastify';

interface Participant extends Client {
  onSocketClose?: () => void;
}

export class Tournament {
  public readonly game = 'tournament';
  public readonly id;
  public readonly name;

  private readonly server: FastifyInstance;

  private participants: Participant[] = [];
  private _started = false;

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

  public addParticipant(participant: Participant, isOwner = false) {
    if (!isOwner)
      try {
        this.server.playAvailability(participant);
      } catch {
        return;
      }

    this.participants.push(participant);

    participant.onSocketClose = () => this.removeParticipant(participant);

    participant.socket.on('close', participant.onSocketClose);
    participant.socket.on('error', participant.onSocketClose);
  }

  get started() {
    return this._started;
  }

  public removeClient(client: Client) {
    const participant = this.participants.find(
      participant => participant.socket === client.socket,
    );
    if (participant) this.removeParticipant(participant);
  }

  private removeParticipant(participant: Participant) {
    this.participants = this.participants.filter(p => p !== participant);

    if (participant.onSocketClose) {
      participant.socket.off('close', participant.onSocketClose);
      participant.socket.off('error', participant.onSocketClose);
    }
  }

  private sendSocket(socket: WebSocket, message: ServerTunnelMessage) {
    return socket.send(Clients.message(message));
  }
}
