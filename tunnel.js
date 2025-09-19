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
const connect = token => {
  if (token) protocol = token;

  socket?.close();
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
    console.error('\r</', event);
    process.stdout.write(prompt);
  });
};
connect();

const send = data => socket.send(JSON.stringify(data));
const setToken = token => (protocol = token);

const createTournament = name => send({type: 'createTournament', name});
const joinMatchmaking = (game = 'pong', mode = 'casual') =>
  send({type: 'joinMatchmaking', game, mode});
const joinTournament = tournamentID =>
  send({type: 'joinTournament', tournamentID});
const leaveMatchmaking = () => send({type: 'leaveMatchmaking'});
const leaveTournament = () => send({type: 'leaveTournament'});
const move = direction => send({type: 'move', direction});
const score = scorerID => send({type: 'score', scorerID});

socket.addEventListener('open', () => {
  console.log();
  const r = repl.start(prompt);

  const ft = 42;

  const context = {
    ft,

    connect,
    send,
    setToken,

    createTournament,
    joinMatchmaking,
    joinTournament,
    leaveMatchmaking,
    leaveTournament,
    move,
    score,
  };

  Object.entries(context).forEach(([key, value]) => (r.context[key] = value));

  r.on('exit', () => socket?.close());
});
