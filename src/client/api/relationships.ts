import {Api} from '../utils/Api';
import {Store} from '../services/store';
import {Toastify} from '../utils/toastify';
import {fetchDiscussion} from './chats';

const api = Api.getInstance();

export const fetchFriendRequests = async () => {
  const store = Store.getInstance();

  try {
    const response = await api.get('relationships/friends/requests/received');

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    const data = await response.json();
    store.setState({friendRequests: data});
  } catch (error) {
    Toastify.error('Could not fetch friend requests');
    console.error(error);
  }
};

export const fetchSentFriendRequests = async () => {
  const store = Store.getInstance();

  try {
    const response = await api.get('relationships/friends/requests/sent');

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    const data = await response.json();
    store.setState({sentFriendRequests: data});
  } catch (error) {
    Toastify.error('Could not fetch sent friend requests');
    console.error(error);
  }
};

export const fetchBlockedUsers = async () => {
  const store = Store.getInstance();
  try {
    const response = await api.get('relationships/block');

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    const data = await response.json();
    store.setState({blockedUsers: data});
  } catch (error) {
    Toastify.error('An error occurred while fetching blocked users');
    console.error(error);
  }
};

export const sendFriendRequest = async (username: string) => {
  try {
    const response = await api.post('relationships/friends/requests', {
      username,
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.message !== 'User not found')
        throw new Error(errorData.message);
    }

    Toastify.success('Friend request sent successfully');
  } catch (error) {
    Toastify.error('Could not send friend request');
    console.error(error);
  }
};

export const blockUser = async (userID: number, username: string) => {
  const store = Store.getInstance();

  try {
    const response = await api.post(`relationships/block/${userID}`, {});

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    store.setState({chatView: {label: 'chatsList'}});
    Toastify.success(`You blocked ${username}`);
  } catch (error) {
    Toastify.error(
      `An error occured while closing relationship with ${username}`,
    );
    console.error(error);
  }
};

export const acceptFriendRequest = async (
  username: string,
  userID: number,
  relationshipID: number,
) => {
  const store = Store.getInstance();
  try {
    const response = await api.patch(`relationships/${relationshipID}`, {});

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    const {friendRequests} = store.getState();

    const user = friendRequests.find(r => r.id === userID);
    if (!user) {
      console.warn('User not found when accepting friend request');
      return;
    }

    const filteredRequests = friendRequests.filter(request => {
      return request.id !== userID;
    });
    const fetchDiscussionResponse = await fetchDiscussion(userID);
    const {directChats} = store.getState();
    const lastMessage =
      fetchDiscussionResponse.data.messages.length > 0 &&
      fetchDiscussionResponse.data.messages[
        fetchDiscussionResponse.data.messages.length - 1
      ];

    store.setState({
      friendRequests: filteredRequests,
      countFriendRequests: filteredRequests.length,
      directChats: [
        ...directChats,
        {
          relationshipID: relationshipID,
          updatedAt: new Date().toISOString(),
          content: lastMessage?.content || '',
          unread: 0,
          user: user,
        },
      ],
      chatView: {
        id: userID,
        label: username,
      },
    });
    Toastify.success(`You can now chat with ${username}!`);
  } catch (error) {
    Toastify.error('An error occured while accepting friend request');
    console.error(error);
  }
};

export const closeRequest = async (
  username: string,
  relationshipID: number,
) => {
  const store = Store.getInstance();
  try {
    const response = await api.delete(`relationships/${relationshipID}`, {});

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    const {friendRequests, sentFriendRequests} = store.getState();
    store.setState({
      friendRequests: friendRequests.filter(
        request => request.username !== username,
      ),
      sentFriendRequests: sentFriendRequests.filter(
        request => request.username !== username,
      ),
    });
    Toastify.success(`Closed request`);
  } catch (error) {
    Toastify.error('An error occured while accepting friend request');
    console.error(error);
  }
};

export const unfriendUser = async (
  relationshipID: number,
  username: string,
) => {
  const store = Store.getInstance();

  try {
    const response = await api.delete(`relationships/${relationshipID}`, {});

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    const {directChats} = store.getState();
    store.setState({
      chatView: {label: 'chatsList'},
      directChats: directChats.filter(c => c.relationshipID !== relationshipID),
    });
    Toastify.success(`You and ${username} are no longer friends anymore`);
  } catch (error) {
    Toastify.error(
      `An error occured while closing relationship with ${username}`,
    );
    console.error(error);
  }
};

export const unblockUser = async (relationshipID: number) => {
  try {
    const response = await api.delete(`relationships/${relationshipID}`, {});

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    fetchBlockedUsers();
    Toastify.success('User unblocked successfully');
  } catch (error) {
    Toastify.error('An error occurred while unblocking a user');
    console.error(error);
  }
};
