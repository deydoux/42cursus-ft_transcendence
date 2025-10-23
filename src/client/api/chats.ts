import {Api} from '../utils/Api';
import {Store} from '../services/store';
import {Toastify} from '../utils/toastify';

const api = Api.getInstance();

export const fetchChats = async () => {
  const store = Store.getInstance();

  try {
    const response = await api.get('chats');

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    const data = await response.json();
    store.setState({
      directChats: data.directs,
      generalChat: data.general,
      countFriendRequests: data.friendRequests,
    });
  } catch (error) {
    Toastify.error('Could not fetch direct chats');
    console.error(error);
  }
};

export const fetchDiscussion = async (userID: number) => {
  const store = Store.getInstance();

  try {
    const response = await api.get(`chats/direct/${userID}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    const data = await response.json();
    store.setState({discussion: data});
  } catch (error) {
    Toastify.error('An error occured while fetching discussion');
    console.error(error);
  }
};

export const markMessagesAsRead = async (userID: number) => {
  try {
    const response = await api.patch(`chats/direct/${userID}`, {});

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }
  } catch (error) {
    Toastify.error('An error occured while smarking messages as read');
    console.error(error);
  }
};

export const fetchGeneralDiscussion = async () => {
  const store = Store.getInstance();

  try {
    const response = await api.get('chats/general');

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    const data = await response.json();
    store.setState({generalDiscussion: data});
  } catch (error) {
    Toastify.error('An error occured while fetching general discussion');
    console.error(error);
  }
};

export const loadMoreMessages = async (nextUri: string) => {
  const store = Store.getInstance();

  try {
    nextUri = nextUri.replaceAll('/api/', '');
    const response = await api.get(nextUri);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    const data = await response.json();
    const isGeneral = nextUri.includes('general');

    if (isGeneral) {
      const {generalDiscussion} = store.getState();
      if (!generalDiscussion) return;

      const newMessages = [
        ...(generalDiscussion?.messages ?? []),
        ...data.messages,
      ];

      store.setState({
        generalDiscussion: {
          ...generalDiscussion,
          messages: newMessages,
          users: {...generalDiscussion.users, ...data.users},
          next: data.next,
        },
      });
    } else {
      const {discussion} = store.getState();
      if (!discussion) return;

      const newMessages = [...(discussion?.messages ?? []), ...data.messages];
      store.setState({
        discussion: {
          ...discussion,
          messages: newMessages,
          next: data.next,
        },
      });
    }
  } catch (error) {
    Toastify.error('An error occured while fetching discussion');
    console.error(error);
  }
};

export const sendPrivateMessage = async (toUserID: number, message: string) => {
  if (message.length === 0 || message.trim().length === 0) return;
  const store = Store.getInstance();

  try {
    const response = await api.post(`chats/direct/${toUserID}`, {
      content: message,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    const {discussion, directChats, user} = store.getState();
    if (!discussion) return;

    const newMessage = {
      id: (discussion.messages[0]?.id ?? 0) + 1,
      senderID: user?.id ?? 0,
      content: message,
      createdAt: new Date().toISOString(),
    };
    store.setState({
      discussion: {
        ...discussion,
        messages: [newMessage, ...discussion.messages],
      },
    });
    store.setState({
      directChats: directChats.map(chat => {
        if (chat.user.id === toUserID) return {...chat, content: message};
        else return chat;
      }),
    });
  } catch (error) {
    Toastify.error('An error occured while sending a message');
    console.error(error);
  }
};

export const sendGeneralMessage = async (message: string) => {
  if (message.length === 0 || message.trim().length === 0) return;
  const store = Store.getInstance();

  try {
    const response = await api.post(`chats/general`, {
      content: message,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    const {generalDiscussion, generalChat, user} = store.getState();
    if (!generalDiscussion || !user)
      throw new Error('generalDiscussion or user undefined');

    const now = new Date().toISOString();

    const newMessages = [
      {
        id: (generalDiscussion.messages[0]?.id ?? 0) + 1,
        userID: user.id,
        content: message,
        createdAt: now,
      },
      ...generalDiscussion.messages,
    ];
    store.setState({
      generalDiscussion: {...generalDiscussion, messages: newMessages},
    });

    let newGeneralChat;
    if (generalChat) {
      newGeneralChat = {...generalChat, content: message};
    } else {
      newGeneralChat = {
        content: message,
        user: user,
        createdAt: now,
      };
    }

    store.setState({generalChat: newGeneralChat});
  } catch (error) {
    Toastify.error('An error occured while sending a message');
    console.error(error);
  }
};
