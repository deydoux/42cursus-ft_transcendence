import {Chat} from '../containers/chat/Chat';
import {DOMUtils} from '../utils/dom';
import {FriendRequests} from '../containers/chat/friendRequests';
import {Store} from '../services/store';
import {Toastify} from '../utils/toastify';
import {socket} from '../utils/websocket';

const toastMessageNotification = (
  user: {
    username: string;
    avatar: string;
    id: number;
  },
  message: string,
  isGeneralMessage?: boolean,
) => {
  const container = DOMUtils.createElement('div', {
    className: 'flex items-center gap-4',
  });

  container.appendChild(
    DOMUtils.createElement('img', {
      className: 'w-10 h-10 rounded-full',
      attributes: {
        src: user.avatar,
      },
    }),
  );

  const userInfo = DOMUtils.createElement('div');
  userInfo.appendChild(
    DOMUtils.createElement('p', {
      className: 'font-bold -mb-1',
      textContent: user.username,
    }),
  );
  userInfo.appendChild(
    DOMUtils.createElement('p', {
      textContent: `General: ${message}`,
    }),
  );
  container.appendChild(userInfo);

  Toastify.info(container, {
    onClick: (toastID: string) => {
      Toastify.dismiss(toastID);
      Store.getInstance().setState(
        isGeneralMessage
          ? {
              chatView: {label: user.username, id: user.id},
            }
          : {chatView: {label: 'general'}},
      );
    },
    closable: false,
  });
};

const toastFriendRequestNotification = (
  user: {
    username: string;
    avatar: string;
    id: number;
  },
  relationshipID: number,
) => {
  const acceptButton = DOMUtils.createElement('button', {
    className:
      'cursor-pointer border rounded flex items-center justify-center w-6 h-6',
    textContent: '✓',
  });
  acceptButton.onclick = async () => {
    Toastify.dismissAll();
    await FriendRequests.acceptFriendRequest(
      user.username,
      user.id,
      relationshipID,
    );
  };
  const refuseButton = DOMUtils.createElement('button', {
    className:
      'cursor-pointer border rounded flex items-center justify-center w-6 h-6',
    textContent: '✗',
  });
  refuseButton.onclick = async () => {
    Toastify.dismissAll();
    await FriendRequests.closeRequest(user.username, relationshipID);
  };

  const content = DOMUtils.createElement('div', {
    className: 'flex items-center gap-4',
  });
  content.appendChild(
    DOMUtils.createElement('img', {
      className: 'w-10 h-10 rounded-full',
      attributes: {
        src: user.avatar,
      },
    }),
  );

  const userInfos = DOMUtils.createElement('div', {
    className: 'max-w-30 leading-tight',
  });
  userInfos.innerHTML = `<strong>${user.username}</strong> wants to be your friend!`;

  content.appendChild(userInfos);

  Toastify.info(content, {
    closable: false,
    actionButtons: [acceptButton, refuseButton],
  });
};

const handleDirectMessage = (data: {
  sender: {
    id: number;
    username: string;
    avatar: string;
  };
  content: string;
}) => {
  const store = Store.getInstance();

  const {directChats, chatView, discussion} = store.getState();
  if (chatView.id === data.sender.id && discussion) {
    // In a private discussion
    store.setState({
      discussion: {
        ...discussion,
        user: {
          ...discussion.user,
          online: true,
        },
        messages: [
          {
            id: 0,
            senderID: data.sender.id,
            content: data.content,
            createdAt: new Date().toISOString(),
          },
          ...discussion.messages,
        ],
      },
    });

    Chat.markMessagesAsRead(data.sender.id);
  } else {
    // In the chats list
    store.setState({
      directChats: directChats.map(chat => {
        if (chat.user.username !== data.sender.username) {
          return chat;
        }

        return {
          ...chat,
          content: data.content,
          updatedAt: new Date().toISOString(),
        };
      }),
    });

    toastMessageNotification(data.sender, data.content);
  }
};

const handleGeneralMessage = (data: {
  sender: {
    id: number;
    username: string;
    avatar: string;
  };
  content: string;
  mention: boolean;
}) => {
  const store = Store.getInstance();

  const {generalChat, chatView, generalDiscussion} = store.getState();
  if (chatView.label === 'general' && generalDiscussion) {
    // Inside the general chat
    store.setState({
      generalDiscussion: {
        ...generalDiscussion,
        messages: [
          {
            id: 0,
            userID: data.sender.id,
            content: data.content,
            createdAt: new Date().toISOString(),
          },
          ...generalDiscussion.messages,
        ],
      },
    });
  } else if (generalChat) {
    // In the chats list
    store.setState({
      generalChat: {
        ...generalChat,
        content: data.content,
        createdAt: new Date().toISOString(),
      },
    });

    if (data.mention) {
      toastMessageNotification(data.sender, data.content);
    }
  }
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

  toastFriendRequestNotification(data.user, data.relationship);
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
  socket.on('generalMessage', handleGeneralMessage);
  socket.on('friendRequest', handleFriendRequest);
  socket.on('friendRequestAccepted', handleFriendRequestAccepted);
};
