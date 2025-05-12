import {FastifyInstance, FastifyRequest} from 'fastify';
import {RawData} from 'ws';
import SQL from 'sql-template-strings';
import {WebSocket} from '@fastify/websocket';

export default class Clients {
  private clients: {
    id: number;
    connection: number;
    socket: WebSocket;
  }[] = [];
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

    void message;
  };

  private message = (message: TunnelMessage) => JSON.stringify(message);

  routeHandler = (socket: WebSocket, request: FastifyRequest) => {
    const connection = request.connection || 0;
    const id = request.user?.id || 0;

    this.clients.push({id, connection, socket});

    socket.on('close', () => {
      const index = this.clients.findIndex(client => client.socket === socket);
      if (index !== -1) this.clients.splice(index, 1);
      if (id)
        this.server.db.run(
          SQL`UPDATE users SET last_seen = unixepoch() WHERE id = ${id}`,
        );
    });

    socket.on('message', this.handleMessage(socket));
  };

  broadcast = (message: TunnelMessage) =>
    this.clients.forEach(client => client.socket.send(this.message(message)));

  closeConnection = (connection: number | null) => {
    this.clients.forEach(client => {
      if (client.connection === connection) {
        client.socket.send(this.message({type: 'close'}));
        client.socket.close();
      }
    });
  };

  closeUser = (id: number, ignoreConnection: number | null = null) => {
    this.clients.forEach(client => {
      if (client.id === id && client.connection !== ignoreConnection) {
        client.socket.send(this.message({type: 'close'}));
        client.socket.close();
      }
    });
  };

  isOnline = (id: number) => this.clients.some(client => client.id === id);
}
