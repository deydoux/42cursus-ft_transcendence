import {Client, ServerTunnelMessage} from '#types/Clients';
import Clients from '#lib/Clients';
import {FastifyInstance} from 'fastify';
import {Player} from '#lib/Match';
import PongMatch from '#lib/PongMatch';
import {RawData} from 'ws';
import SQL from 'sql-template-strings';
import serializeUserAvatar from '#lib/serializeUserAvatar';

interface Participant extends Player {
  onSocketMessage?: (data: RawData) => void;
  onSocketClose?: () => void;
}

const MAX_PARTICIPANTS = 8;

class Round {
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
        type: 'success',
        origin: 'joinTournament',
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

  get owner() {
    return this.participants[0];
  }

  public removeClient(client: Client) {
    const participant = this.participants.find(
      participant => participant.socket === client.socket,
    );
    if (participant) this.removeParticipant(participant);
  }

  private async removeParticipant(participant: Participant) {
    // TODO: forfeit if started
    this.participants = this.participants.filter(p => p !== participant);

    if (participant.onSocketMessage)
      participant.socket.off('message', participant.onSocketMessage);
    if (participant.onSocketClose) {
      participant.socket.off('close', participant.onSocketClose);
      participant.socket.off('error', participant.onSocketClose);
    }

    delete this.server.game.players[participant.userID];

    Clients.sendClient(participant, {
      type: 'success',
      origin: 'leaveTournament',
    });

    if (this.participants.length === 0)
      return this.server.tournaments.delete(this.id);

    this.send({
      type: 'participantLeft',
      userID: participant.userID,
      ownerID: this.participants[0].userID,
    });
  }

  private send(message: ServerTunnelMessage) {
    for (const participant of this.participants) {
      Clients.sendClient(participant, message);
    }
  }

  get participantCount() {
    return this.participants.length;
  }

  private start(participant: Participant) {
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

    const size = 2 ** Math.floor(Math.log2(this.participants.length) + 1);
    this.round = new Round(this.server, size);

    //TODO
    // this.send({
    //   type: 'tournamentStarted',
    // });

    this.server.tournaments.delete(this.id);
  }
}
