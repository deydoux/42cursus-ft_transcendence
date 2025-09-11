#!/usr/bin/env node
import repl from 'node:repl';

const scheme = 'ws';
const host = 'localhost';
const port = 3000;
const path = '/api/tunnel';

const prompt = '> ';

const url = `${scheme}://${host}:${port}${path}`;

if (process.argv.length < 3) {
  console.error(`Usage: node tunnel.js <token>`);
  process.exit(1);
}
let protocol = process.argv[2];

let socket;
const connect = () => {
  socket = new WebSocket(url, protocol);

  socket.addEventListener('message', event => {
    console.log('\r<', JSON.parse(event.data));
    process.stdout.write(prompt);
  });

  socket.addEventListener('error', error => {
    console.error('\r<X', error);
    process.stdout.write(prompt);
  });

  socket.addEventListener('close', event => {
    console.error('\r</ Socket closed');
  });
};
connect();

const send = data => socket.send(JSON.stringify(data));
const setToken = token => (protocol = token);

const joinMatchmaking = (game = 'pong', mode = 'casual') =>
  send({
    type: 'joinMatchmaking',
    game,
    mode,
  });

socket.addEventListener('open', () => {
  console.log();
  const r = repl.start(prompt);

  r.context.connect = connect;
  r.context.ft = 42;
  r.context.joinMatchmaking = joinMatchmaking;
  r.context.send = send;
  r.context.setToken = setToken;

  r.on('exit', () => {
    if (socket?.readyState === WebSocket.OPEN) socket.close();
  });
});
