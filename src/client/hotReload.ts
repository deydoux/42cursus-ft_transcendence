const socket = new WebSocket('/api/tunnel');
socket.addEventListener('message', data => {
  const message = JSON.parse(data.data);
  if (message.type === 'hotReload') window.location.reload();
});
