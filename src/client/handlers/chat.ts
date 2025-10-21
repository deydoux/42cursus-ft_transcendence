import {acceptFriendRequest, closeRequest} from '../api/relationships';
import {Socket} from '../services/websocket';
import {Store} from '../services/store';
import {Toastify} from '../utils/toastify';
import {createElement} from '../utils/dom';
import {markMessagesAsRead} from '../api/chats';

const toastMessageNotification = (
  user: {
    username: string;
    avatar: string;
    id: number;
  },
  message: string,
  isGeneralMessage?: boolean,
) => {
  const container = createElement('div', {
    className: 'flex items-center gap-4',
  });

  container.appendChild(
    createElement('img', {
      className: 'w-10 h-10 rounded-full',
      attributes: {
        src: user.avatar,
      },
    }),
  );

  const userInfo = createElement('div');
  userInfo.appendChild(
    createElement('p', {
      className: 'font-bold -mb-1',
      textContent: user.username,
    }),
  );
  userInfo.appendChild(
    createElement('p', {
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
  const acceptButton = createElement('button', {
    className: `cursor-pointer border rounded flex items-center justify-center w-6 h-6`,
    textContent: '✓',
  });
  acceptButton.onclick = async () => {
    Toastify.dismissAll();
    await acceptFriendRequest(user.username, user.id, relationshipID);
  };
  const refuseButton = createElement('button', {
    className: `cursor-pointer border rounded flex items-center justify-center w-6 h-6`,
    textContent: '✗',
  });
  refuseButton.onclick = async () => {
    Toastify.dismissAll();
    await closeRequest(user.username, relationshipID);
  };

  const content = createElement('div', {
    className: 'flex items-center gap-4',
  });
  content.appendChild(
    createElement('img', {
      className: 'w-10 h-10 rounded-full',
      attributes: {
        src: user.avatar,
      },
    }),
  );

  const userInfos = createElement('div', {
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

    markMessagesAsRead(data.sender.id);
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
            mention: data.mention,
          },
          ...generalDiscussion.messages,
        ],
        users: {
          ...generalDiscussion.users,
          [data.sender.id]: data.sender,
        },
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
  const websocket = Socket.getInstance();
  websocket.on('directMessage', handleDirectMessage);
  websocket.on('generalMessage', handleGeneralMessage);
  websocket.on('friendRequest', handleFriendRequest);
  websocket.on('friendRequestAccepted', handleFriendRequestAccepted);
};
