import {Client, ClientTunnelMessage, ServerTunnelMessage} from '#types/Clients';
import Clients from '#lib/Clients';
import {Data} from 'ws';
import {FastifyInstance} from 'fastify';

interface Participant extends Client {
  onSocketClose?: () => void;
  onSocketMessage?: (data: Data) => void;
}

export class Tournament {
  public readonly game = 'tournament';

  private readonly server: FastifyInstance;
  private readonly id;
  private readonly name;

  private participants: Participant[] = [];

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
    participant.onSocketMessage = this.handleMessage(participant);

    participant.socket.on('close', participant.onSocketClose);
    participant.socket.on('error', participant.onSocketClose);
    participant.socket.on('message', participant.onSocketMessage);
  }

  private handleMessage = (participant: Participant) => (data: Data) => {
    let message: Record<string, unknown>;
    try {
      message = JSON.parse(data.toString());
    } catch {
      return;
    }

    void message;
  };

  private removeParticipant(participant: Participant) {
    this.participants = this.participants.filter(p => p !== participant);

    if (participant.onSocketClose) {
      participant.socket.off('close', participant.onSocketClose);
      participant.socket.off('error', participant.onSocketClose);
    }
    if (participant.onSocketMessage)
      participant.socket.off('message', participant.onSocketMessage);
  }

  private sendSocket(socket: WebSocket, message: ServerTunnelMessage) {
    return socket.send(Clients.message(message));
  }
}
