import { socket } from "../utils/websocket";

const handleMatchStart = (data?: any) => {
  console.log('match start handler', data);
}

export const setupGameHandlers = () => {
  socket.on('matchStart', handleMatchStart);
};
