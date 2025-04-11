export default class HotReload {
  private static path = '/dev/watch';

  constructor() {
    const socket = new WebSocket(HotReload.path);
    socket.addEventListener('message', () => {
      window.location.reload();
    });
  }
}
