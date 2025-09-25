import {Popup, createPopupContainer} from '../../components/Popup';
import {
  blockUser,
  sendFriendRequest,
  unfriendUser,
} from '../../api/relationships';
import {Store} from '../../services/store';
import {createElement} from '../../utils/dom';

let contextMenu: Popup | null = null;

export const renderUserContextMenu = (
  user: {username: string; id: number},
  includeButtons: ('unfriend' | 'friend' | 'invite' | 'block' | 'markAsRead')[],
  origin: number[],
) => {
  const store = Store.getInstance();

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

  const inviteButton = createElement('div', {
    className: `block cursor-pointer w-full text-left px-2 py-1 rounded hover:bg-white/10`,
    textContent: `Play pong`,
    events: {
      click: () => {
        // TODO: Invite in a pong game
      },
    },
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
  if (includeButtons.includes('invite')) buttons.appendChild(inviteButton);

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
