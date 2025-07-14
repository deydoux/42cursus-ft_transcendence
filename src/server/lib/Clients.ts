import {Client, TunnelMessage} from '#types/Clients';
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
        this.message({type: 'error', message: 'Invalid JSON'}),
      );
    }

    const client = this.clients.find(client => client.socket === socket);
    if (!client)
      return socket.send(
        this.message({type: 'error', message: 'Client not found'}),
      );

    if (message.type) {
      const handlers: Record<
        string,
        (
          server: FastifyInstance,
          client: Client,
          message: TunnelMessage,
        ) => void
      > = {joinMatchmaking, leaveMatchmaking};
      const handler = handlers[message.type];

      if (!handler)
        return socket.send(
          this.message({type: 'error', message: 'Unknown message type'}),
        );

      handler(this.server, client, message);
    }
  };

  message = (message: TunnelMessage) => JSON.stringify(message);

  routeHandler = (socket: WebSocket, request: FastifyRequest) => {
    if (!request.user)
      socket.send(
        this.message({type: 'error', message: 'Authentication failed'}),
      );

    const connection = request.connection || 0;
    const userID = request.user?.id || 0;

    this.clients.push({userID, connection, socket});

    socket.on('close', () => {
      const index = this.clients.findIndex(client => client.socket === socket);
      if (index !== -1) this.clients.splice(index, 1);
      if (!userID) return;

      // Remove from matchmaking queues
      if (this.server.pong.queues.casual?.socket === socket)
        this.server.pong.queues.casual = null;

      this.server.db.run(SQL`
        UPDATE users
        SET last_seen = unixepoch()
        WHERE id = ${userID}
      `);
    });

    socket.on('message', this.handleMessage(socket));
  };

  broadcast = (message: TunnelMessage) =>
    this.clients.forEach(client => client.socket.send(this.message(message)));

  closeConnection = (connection: number | null) =>
    this.clients.forEach(client => {
      if (client.connection === connection) client.socket.close();
    });

  closeUser = (id: number, ignoreConnection: number | null = null) =>
    this.clients.forEach(client => {
      if (client.userID === id && client.connection !== ignoreConnection)
        client.socket.close();
    });

  isUserOnline = (id: number) =>
    this.clients.some(client => client.userID === id);

  sendUser = (id: number, message: TunnelMessage) =>
    this.clients.forEach(client => {
      if (client.userID === id) client.socket.send(this.message(message));
    });
}
