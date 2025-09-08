import {BaseComponent} from '../../components/BaseComponent';
import {ChatsList} from './chatsList';
import {DOMUtils} from '../../utils/dom';
import {Discussion} from './discussion';
import {FriendRequests} from './friendRequests';
import {Toastify} from '../../utils/toastify';
import {UserCard} from './userCard';
import {api} from '../../utils/Api';
import {loadIcons} from '../../utils/icons';
import {renderGDPR} from './gdpr';

export class Chat extends BaseComponent {
  private chatsList: ChatsList;
  private friendRequests: FriendRequests;
  private discussion: Discussion;
  private userCard: UserCard;

  constructor() {
    super();
    this.chatsList = new ChatsList(this.store);
    this.friendRequests = new FriendRequests(this.store);
    this.discussion = new Discussion(this.store);
    this.userCard = new UserCard(this.store, this.router);
  }

  static async markMessagesAsRead(userID: number) {
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
  }

  render(): HTMLElement | undefined {
    const container = DOMUtils.createElement('div', {
      className:
        'w-[400px] max-h-[100%] h-full overflow-hidden flex-none flex flex-col gap-4',
    });

    const userCard = DOMUtils.createElement('div', {
      className:
        'flex-none flex items-center justify-between bg-linear-to-bl from-pink-300/5 to-pink-400/10 p-3 rounded-lg border border-pink-300/10',
    });
    const renderUserCard = () => {
      userCard.innerHTML = '';
      this.userCard.render(userCard);
    };

    renderUserCard();
    this.store.subscribeToPath('user', renderUserCard);
    container.appendChild(userCard);

    const view = DOMUtils.createElement('div');
    const renderView = () => {
      const {chatView, user} = this.store.getState();
      if (!user) return;
      view.innerHTML = '';

      switch (chatView.label) {
        case 'friendRequests':
          view.appendChild(this.friendRequests.render());
          break;
        case 'chatsList':
          view.appendChild(this.chatsList.render());
          break;
        default:
          view.appendChild(this.discussion.render());
      }

      view.className =
        'flex-1 overflow-hidden border border-pink-300 rounded-xl flex flex-col';
    };

    renderView();
    container.appendChild(view);
    this.store.subscribeToPath('chatView', renderView);

    container.appendChild(renderGDPR());

    this.store.subscribe(loadIcons);
    return container;
  }
}
