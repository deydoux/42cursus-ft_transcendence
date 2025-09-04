import {Client, ServerTunnelMessage} from '#types/Clients';
import {FastifyInstance, FastifyRequest} from 'fastify';
import {RawData} from 'ws';
import SQL from 'sql-template-strings';
import {WebSocket} from '@fastify/websocket';
import createTournament from '#tunnel/createTournament';
import joinMatchmaking from '#tunnel/joinMatchmaking';
import joinTournament from '#tunnel/joinTournament';
import leaveMatchmaking from '#tunnel/leaveMatchmaking';
import leaveTournament from '#tunnel/leaveTournament';

export default class Clients {
  private clients: Client[] = [];
  private server;

  constructor(server: FastifyInstance) {
    this.server = server;
  }

  private handleMessage = (socket: WebSocket) => (data: RawData) => {
    let message;
    try {
      message = JSON.parse(data.toString());
    } catch {
      return Clients.sendSocket(socket, {
        type: 'error',
        message: 'Invalid JSON',
      });
    }

    if (
      !message ||
      typeof message !== 'object' ||
      typeof message.type !== 'string'
    )
      return Clients.sendSocket(socket, {
        type: 'error',
        message: 'Invalid message type',
      });

    const client = this.clients.find(client => client.socket === socket);
    if (!client)
      return Clients.sendSocket(socket, {
        type: 'error',
        message: 'Client not found',
      });

    if (message.type) {
      switch (message.type) {
        case 'createTournament':
          createTournament(this.server, client, message);
          break;
        case 'joinMatchmaking':
          joinMatchmaking(this.server, client, message);
          break;
        case 'joinTournament':
          joinTournament(this.server, client, message);
          break;
        case 'leaveMatchmaking':
          leaveMatchmaking(this.server, client, message);
          break;
        case 'leaveTournament':
          leaveTournament(this.server, client, message);
          break;
      }
    }
  };

  public static sendClient = (client: Client, message: ServerTunnelMessage) =>
    this.sendSocket(client.socket, message);
  public static sendSocket = (
    socket: WebSocket,
    message: ServerTunnelMessage,
  ) => socket.send(JSON.stringify(message));

  public routeHandler = (socket: WebSocket, request: FastifyRequest) => {
    if (!request.user)
      Clients.sendSocket(socket, {
        type: 'error',
        message: 'Authentication failed',
      });

    const session = request.session || 0;
    const userID = request.user?.id || 0;

    this.clients.push({userID, session, socket});

    socket.on('close', () => {
      this.clients = this.clients.filter(client => client.socket !== socket);
      if (!userID) return;

      this.server.leaveMatchmaking(socket);

      this.server.db.run(SQL`
        UPDATE users
        SET last_seen = unixepoch()
        WHERE id = ${userID}
      `);
    });

    socket.on('message', this.handleMessage(socket));
  };

  public broadcast = (message: ServerTunnelMessage, ignoreIDs?: number[]) => {
    if (ignoreIDs)
      this.clients.forEach(client => {
        if (!ignoreIDs.includes(client.userID))
          Clients.sendClient(client, message);
      });
    else this.clients.forEach(client => Clients.sendClient(client, message));
  };

  public closeSession = (session: number | null) =>
    this.clients.forEach(client => {
      if (client.session === session) client.socket.close();
    });

  public closeUser = (id: number, ignoreSession: number | null = null) =>
    this.clients.forEach(client => {
      if (client.userID === id && client.session !== ignoreSession)
        client.socket.close();
    });

  public isUserOnline = (id: number) =>
    this.clients.some(client => client.userID === id);

  public sendUser = (id: number, message: ServerTunnelMessage) =>
    this.clients.forEach(client => {
      if (client.userID === id) Clients.sendClient(client, message);
    });
}
