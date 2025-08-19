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

const handleFriendRequest = (data: {
  user: {
    id: number;
    username: string;
    avatar: string;
  };
  relationship: number;
}) => {
  const store = Store.getInstance();

  const {friendRequests} = store.getState();
  store.setState({
    friendRequests: [
      ...friendRequests,
      {
        relationshipID: data.relationship,
        createdAt: new Date().toISOString(),
        id: data.user.id,
        username: data.user.username,
        avatar: data.user.avatar,
      },
    ],
  });

  Toastify.info(`You received a new friend request from ${data.user.username}`);
};

const handleFriendRequestAccepted = (data: {
  user: {
    id: number;
    username: string;
    avatar: string;
  };
  relationship: number;
}) => {
  const store = Store.getInstance();

  const {sentFriendRequests} = store.getState();
  store.setState({
    sentFriendRequests: sentFriendRequests.filter(
      request => request.username !== data.user.username,
    ),
  });

  Toastify.info(`${data.user.username} accepted your friend request!`);
};

export const setupChatHandlers = () => {
  socket.on('directMessage', handleDirectMessage);
  socket.on('friendRequest', handleFriendRequest);
  socket.on('friendRequestAccepted', handleFriendRequestAccepted);
};
