import {Client, ServerTunnelMessage} from '#types/Clients';
import Clients from '#lib/Clients';
import {FastifyInstance} from 'fastify';
import {RawData} from 'ws';
import {WebSocket} from '@fastify/websocket';
import SQL from 'sql-template-strings';
import serializeUserAvatar from './serializeUserAvatar';

interface Participant extends Client {
  onSocketMessage?: (data: RawData) => void;
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

  public async addParticipant(participant: Participant, isOwner = false) {
    if (!isOwner)
      try {
        this.server.playAvailability(participant);
      } catch {
        return;
      }

    if (this.participants.length > 0) {
      const user = await this.server.db.get(SQL`
      SELECT id, username, has_avatar, avatar_version
      FROM users
      WHERE id = ${participant.userID}
    `);
      serializeUserAvatar(user);

      this.send({
        type: 'participantJoined',
        participant: user,
      });
    }

    this.participants.push(participant);

    participant.onSocketMessage = this.handleMessage(participant);
    participant.onSocketClose = () => this.removeParticipant(participant);

    participant.socket.on('message', participant.onSocketMessage);
    participant.socket.on('close', participant.onSocketClose);
    participant.socket.on('error', participant.onSocketClose);
  }

  private handleMessage = (participant: Participant) => (data: RawData) => {
    let message;
    try {
      message = JSON.parse(data.toString());
    } catch {
      return;
    }

    switch (message?.type) {
      case 'leaveTournament':
        this.removeParticipant(participant);
        break;
    }
  };

  get started() {
    return this._started;
  }

  public removeClient(client: Client) {
    const participant = this.participants.find(
      participant => participant.socket === client.socket,
    );
    if (participant) this.removeParticipant(participant);
  }

  private async removeParticipant(participant: Participant) {
    this.participants = this.participants.filter(p => p !== participant);

    if (participant.onSocketMessage)
      participant.socket.off('message', participant.onSocketMessage);
    if (participant.onSocketClose) {
      participant.socket.off('close', participant.onSocketClose);
      participant.socket.off('error', participant.onSocketClose);
    }

    this.sendSocket(participant.socket, {
      type: 'success',
      origin: 'leaveTournament',
    });

    if (this.participants.length === 0)
      return this.server.tournaments.delete(this.id);

    const user = await this.server.db.get(SQL`
      SELECT id, username, has_avatar, avatar_version
      FROM users
      WHERE id = ${participant.userID}
    `);
    serializeUserAvatar(user);

    this.send({
      type: 'participantLeft',
      participant: user,
    });
  }

  private send(message: ServerTunnelMessage) {
    for (const participant of this.participants) {
      this.sendSocket(participant.socket, message);
    }
  }

  private sendSocket(socket: WebSocket, message: ServerTunnelMessage) {
    return socket.send(Clients.message(message));
  }

  public start() {
    this._started = true;
  }
}
