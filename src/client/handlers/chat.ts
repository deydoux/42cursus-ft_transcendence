import {Store} from '../services/store';
import {Toastify} from '../utils/toastify';
import {socket} from '../utils/websocket';

const handleDirectMessage = (data: {
  sender: {
    id: number;
    username: string;
    avatar: string;
  };
  content: string;
}) => {
  const store = Store.getInstance();

  const {chats} = store.getState();
  store.setState({
    chats: chats.map(chat => {
      if (chat.username !== data.sender.username) {
        return chat;
      }

      return {
        ...chat,
        content: data.content,
        updatedAt: new Date().toISOString(),
      };
    }),
  });
  Toastify.success('You received a message');
};

export const setupChatHandlers = () => {
  socket.on('directMessage', handleDirectMessage);
};
