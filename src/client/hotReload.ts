const socket = new WebSocket('/dev/watch');
socket.addEventListener('message', () => {
  window.location.reload();
});
