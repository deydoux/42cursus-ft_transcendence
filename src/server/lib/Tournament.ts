import {Client, ServerTunnelMessage} from '#types/Clients';
import Clients from '#lib/Clients';
import {FastifyInstance} from 'fastify';
import {Player} from '#lib/Match';
import {RawData} from 'ws';
import Round from '#lib/Round';
import SQL from 'sql-template-strings';
import serializeUserAvatar from '#lib/serializeUserAvatar';

export interface Participant extends Player {
  onSocketMessage?: (data: RawData) => void;
  onSocketClose?: () => void;
}

const MAX_PARTICIPANTS = 8;

export class Tournament {
  public readonly game = 'tournament';
  public readonly id;
  public readonly name;

  private readonly server: FastifyInstance;

  private participants: Participant[] = [];
  private round?: Round;

  constructor(
    server: FastifyInstance,
    id: number,
    name: string,
    owner: Player,
  ) {
    this.server = server;
    this.id = id;
    this.name = name;
    this.addParticipant(owner);
  }

  public async addParticipant(participant: Participant) {
    if (this.participants.length > 0) {
      try {
        this.server.playAvailability(participant);
      } catch {
        return;
      }

      if (this.participants.length >= MAX_PARTICIPANTS)
        return Clients.sendClient(participant, {
          type: 'error',
          message: 'Tournament is full',
        });

      Clients.sendClient(participant, {
        type: 'tournamentJoined',
        participants: this.participants.map(participant => ({
          id: participant.userID,
          username: participant.username,
          avatar: participant.avatar,
        })),
      });

      const user = await this.server.db.get(SQL`
      SELECT id, username, has_avatar, avatar_version
      FROM users
      WHERE id = ${participant.userID}
    `);
      serializeUserAvatar(user);

      this.send({
        type: 'participantJoin',
        user,
      });
    }

    this.participants.push(participant);

    participant.onSocketMessage = this.handleMessage(participant);
    participant.onSocketClose = () => this.removeParticipant(participant);

    participant.socket.on('message', participant.onSocketMessage);
    participant.socket.on('close', participant.onSocketClose);
    participant.socket.on('error', participant.onSocketClose);

    this.server.game.players[participant.userID] = {match: this};
  }

  public get() {
    const owner = this.participants[0];

    return {
      id: this.id,
      name: this.name,
      participantCount: this.participants.length,
      owner: {
        id: owner.userID,
        username: owner.username,
        avatar: owner.avatar,
      },
    };
  }

  private handleMessage =
    (participant: Participant) => async (data: RawData) => {
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
        case 'startTournament':
          this.start(participant);
          break;
      }
    };

  // public get owner() {
  //   return this.participants[0];
  // }

  public removeClient(client: Client) {
    const participant = this.participants.find(
      participant => participant.socket === client.socket,
    );
    if (participant) this.removeParticipant(participant);
  }

  private async removeParticipant(participant: Participant, silent = false) {
    this.participants = this.participants.filter(p => p !== participant);

    if (participant.onSocketMessage)
      participant.socket.off('message', participant.onSocketMessage);
    if (participant.onSocketClose) {
      participant.socket.off('close', participant.onSocketClose);
      participant.socket.off('error', participant.onSocketClose);
    }

    delete this.server.game.players[participant.userID];

    if (this.round) return;

    if (!silent) {
      Clients.sendClient(participant, {
        type: 'success',
        origin: 'leaveTournament',
      });

      this.send({
        type: 'participantLeft',
        userID: participant.userID,
        ownerID: this.participants[0]?.userID,
      });
    }

    if (this.participants.length === 0) this.server.tournaments.delete(this.id);
  }

  public send(message: ServerTunnelMessage) {
    for (const participant of this.participants) {
      Clients.sendClient(participant, message);
    }
  }

  // get participantCount() {
  //   return this.participants.length;
  // }

  private async start(participant: Participant) {
    if (this.round)
      return Clients.sendClient(participant, {
        type: 'error',
        message: 'Tournament already started',
      });

    if (this.participants[0].userID !== participant.userID)
      return Clients.sendClient(participant, {
        type: 'error',
        message: 'Only the tournament owner can start the tournament',
      });

    if (this.participants.length < 2)
      return Clients.sendClient(participant, {
        type: 'error',
        message: 'Not enough participants to start the tournament',
      });

    const size = 2 ** Math.floor(Math.log2(this.participants.length - 1) + 1);
    this.round = new Round(this.server, this, size);

    const {firstRounds} = this.round;
    const seed = this.participants.sort(() => Math.random() - 0.5);

    for (let i = 0; i < seed.length; i++) {
      let idx = 0;
      let n = i % firstRounds.length;
      let div = 2;

      while (n) {
        idx += (n & 1) * (firstRounds.length / div);
        n >>= 1;
        div *= 2;
      }

      firstRounds[idx].addParticipant(seed[i]);
    }

    this.send({
      type: 'tournamentStarted',
      final: this.round.get(),
    });

    await this.round.start();

    for (const participant of this.participants)
      this.removeParticipant(participant, true);
  }
}
