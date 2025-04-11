import {FastifyPluginAsync} from 'fastify';
import {join} from 'node:path';
import {watch} from 'node:fs';
import {WebSocket} from '@fastify/websocket';
import fp from 'fastify-plugin';

const viewPath = join(__dirname, '..', '..', '..', 'dist');

const plugin: FastifyPluginAsync = async server => {
  if (!server.dev) return;

  const sockets: WebSocket[] = [];

  server.get('/dev/watch', {websocket: true}, socket => {
    const index = sockets.length;

    sockets.push(socket);
    server.log.trace(`Watch dist socket ${index} connected`);

    socket.on('close', () => {
      sockets.splice(index, 1);
      server.log.trace(`Watch dist socket ${index} closed`);
    });
  });

  watch(viewPath, (eventType, filename) => {
    if (filename !== 'index.html' || eventType !== 'change') return;

    sockets.forEach(async socket => {
      socket.send(1);
    });

    server.log.trace('Watched dist change');
  });

  server.log.info(`Watching "${viewPath}" dist`);
};

export default fp(plugin);
