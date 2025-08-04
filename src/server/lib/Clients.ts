import {Client, ServerTunnelMessage} from '#types/Clients';
import {FastifyInstance, FastifyRequest} from 'fastify';
import {RawData} from 'ws';
import SQL from 'sql-template-strings';
import {WebSocket} from '@fastify/websocket';
import joinMatchmaking from '#tunnel/joinMatchmaking';
import leaveMatchmaking from '#tunnel/leaveMatchmaking';

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
      return socket.send(
        Clients.message({type: 'error', message: 'Invalid JSON'}),
      );
    }

    if (
      !message ||
      typeof message !== 'object' ||
      typeof message.type !== 'string'
    )
      return socket.send(
        Clients.message({type: 'error', message: 'Invalid message type'}),
      );

    const client = this.clients.find(client => client.socket === socket);
    if (!client)
      return socket.send(
        Clients.message({type: 'error', message: 'Client not found'}),
      );

    if (message.type) {
      switch (message.type) {
        case 'joinMatchmaking':
          joinMatchmaking(this.server, client, message);
          break;
        case 'leaveMatchmaking':
          leaveMatchmaking(this.server, client, message);
          break;
      }
    }
  };

  static message = (message: ServerTunnelMessage) => JSON.stringify(message);

  routeHandler = (socket: WebSocket, request: FastifyRequest) => {
    if (!request.user)
      socket.send(
        Clients.message({type: 'error', message: 'Authentication failed'}),
      );

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

  broadcast = (message: ServerTunnelMessage) =>
    this.clients.forEach(client =>
      client.socket.send(Clients.message(message)),
    );

  closeSession = (session: number | null) =>
    this.clients.forEach(client => {
      if (client.session === session) client.socket.close();
    });

  closeUser = (id: number, ignoresession: number | null = null) =>
    this.clients.forEach(client => {
      if (client.userID === id && client.session !== ignoresession)
        client.socket.close();
    });

  isUserOnline = (id: number) =>
    this.clients.some(client => client.userID === id);

  sendUser = (id: number, message: ServerTunnelMessage) =>
    this.clients.forEach(client => {
      if (client.userID === id) client.socket.send(Clients.message(message));
    });
}
