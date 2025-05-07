import {FastifyRequest} from 'fastify';
import {RawData} from 'ws';
import {WebSocket} from '@fastify/websocket';

export default class Clients {
  private clients: {
    id: number;
    connection: number;
    socket: WebSocket;
  }[] = [];

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

  closeId = (id: number, ignoreConnection: number | null = null) => {
    this.clients.forEach(client => {
      if (client.id === id && client.connection !== ignoreConnection) {
        client.socket.send(this.message({type: 'close'}));
        client.socket.close();
      }
    });
  };

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
    });

    socket.on('message', this.handleMessage(socket));
  };
}
