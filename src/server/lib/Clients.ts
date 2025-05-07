import {FastifyRequest} from 'fastify';
// import {RawData} from 'ws';
import {WebSocket} from '@fastify/websocket';

export default class Clients {
  private clients: {
    id: number;
    connection: number;
    socket: WebSocket;
  }[] = [];

  handler = (socket: WebSocket, request: FastifyRequest) => {
    const connection = request.connection || 0;
    const id = request.user?.id || 0;

    this.clients.push({id, connection, socket});

    socket.on('close', () => {
      const index = this.clients.findIndex(client => client.socket === socket);
      if (index !== -1) this.clients.splice(index, 1);
    });

    // socket.on('message', this.handleMessage(socket));
  };

  broadcast = (data: unknown) =>
    this.clients.forEach(client => client.socket.send(JSON.stringify(data)));

  // private handleMessage = (socket: WebSocket) => (data: RawData) => {
  //   let message;
  //   try {
  //     message = JSON.parse(data.toString());
  //   } catch {
  //     return socket.send(
  //       JSON.stringify({type: 'error', message: 'Invalid JSON'}),
  //     );
  //   }
  // };

  // remove(connection: number) {
  //   this.clients = this.clients.filter(
  //     client => client.connection !== connection,
  //   );
  // }

  // removeAll(id: number, connection: number) {
  //   this.clients = this.clients.filter(
  //     client => client.id !== id || client.connection === connection,
  //   );
  // }

  // send(id: number, data: unknown) {
  //   this.clients.forEach(client => {
  //     if (client.id === id) client.socket.send(JSON.stringify(data));
  //   });
  // }

  // sendConnection(connection: number, data: unknown) {
  //   this.clients.forEach(client => {
  //     if (client.connection === connection)
  //       client.socket.send(JSON.stringify(data));
  //   });
  // }
}
