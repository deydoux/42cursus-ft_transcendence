import {FastifyPluginAsync} from 'fastify';
import {WebSocket} from '@fastify/websocket';
import {join} from 'node:path';
import {watch} from 'node:fs';

const distPath = join(__dirname, '..', '..', '..', '..', 'dist');

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

  watch(distPath, (eventType, filename) => {
    if (filename !== 'index.html' || eventType !== 'change') return;

    sockets.forEach(async socket => {
      socket.send(1);
    });

    server.log.trace('Watched dist change');
  });

  server.log.info(`Watching "${distPath}" dist`);
};

export default plugin;
