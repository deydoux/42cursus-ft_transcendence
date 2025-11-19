import {Popup, createPopupContainer} from '../../components/Popup';
import {
  blockUser,
  sendFriendRequest,
  unfriendUser,
} from '../../api/relationships';
import {Socket} from '../../services/websocket';
import {Store} from '../../services/store';
import {createElement} from '../../utils/dom';
import {user} from '../../types';

let contextMenu: Popup | null = null;

export const renderUserContextMenu = (
  user: user,
  includeButtons: (
    | 'unfriend'
    | 'friend'
    | 'invite'
    | 'invite-pong'
    | 'invite-race'
    | 'block'
    | 'markAsRead'
  )[],
  origin: number[],
) => {
  const store = Store.getInstance();
  const websocket = Socket.getInstance();

  if (contextMenu) {
    contextMenu.destroy();
  }

  const friendButton = createElement('div', {
    className: `block cursor-pointer w-full text-left px-2 py-1 rounded hover:bg-white/10`,
    textContent: `Send friend request`,
    onclick: async () => {
      await sendFriendRequest(user.username);
      if (contextMenu) contextMenu.destroy();
    },
  });

  const unfriendButton = createElement('div', {
    className: `block cursor-pointer w-full text-left px-2 py-1 rounded hover:bg-white/10`,
    textContent: `Unfriend`,
    onclick: async () => {
      const {directChats} = store.getState();
      const relationshipID = directChats.find(
        chat => chat.user.id === user.id,
      )?.relationshipID;
      await unfriendUser(relationshipID ?? 0, user.username);
      if (contextMenu) contextMenu.destroy();
    },
  });

  const inviteToGame = (game: 'pong' | 'race') => {
    store.setState({
      matchmakingTargetUser: user,
    });
    websocket.send({
      type: 'joinMatchmaking',
      game: game,
      mode: 'casual',
      targetID: user.id,
    });
    if (contextMenu) contextMenu.destroy();
  };

  const invitePongButton = createElement('div', {
    className: `block cursor-pointer w-full text-left px-2 py-1 rounded hover:bg-white/10`,
    textContent: `Invite to play pong`,
    onclick: () => inviteToGame('pong'),
  });
  const inviteRaceButton = createElement('div', {
    className: `block cursor-pointer w-full text-left px-2 py-1 rounded hover:bg-white/10`,
    textContent: `Invite to play race`,
    onclick: () => inviteToGame('race'),
  });

  const blockButton = createElement('div', {
    className: `block cursor-pointer w-full text-left px-2 py-1 rounded hover:bg-red-500/10 hover:text-red-500`,
    textContent: `Block user`,
    onclick: async () => {
      await blockUser(user.id, user.username);
      if (contextMenu) contextMenu.destroy();
    },
  });

  const buttons = createElement('div');
  if (includeButtons.includes('friend')) buttons.appendChild(friendButton);
  else if (includeButtons.includes('unfriend'))
    buttons.appendChild(unfriendButton);
  if (
    includeButtons.includes('invite') ||
    includeButtons.includes('invite-pong')
  )
    buttons.appendChild(invitePongButton);
  if (
    includeButtons.includes('invite') ||
    includeButtons.includes('invite-race')
  )
    buttons.appendChild(inviteRaceButton);

  if (includeButtons.includes('block')) {
    buttons.appendChild(blockButton);
  }

  contextMenu = createPopupContainer({
    x: origin[0],
    y: origin[1],
    className: `absolute min-w-40 bg-background/40 backdrop-blur-md rounded-lg shadow-xl border p-1 border-white/30 text-sm z-50`,
    content: buttons,
    onClose: () => {
      contextMenu = null;
    },
  });

  contextMenu.show();
};
