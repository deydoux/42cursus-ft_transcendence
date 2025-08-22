import {BaseComponent} from '../components/BaseComponent';
import {ChatsList} from './chat/chatsList';
import {DOMUtils} from '../utils/dom';
import {Discussion} from './chat/discussion';
import {FriendRequests} from './chat/friendRequests';
import {Toastify} from '../utils/toastify';
import {api} from '../utils/Api';
import {loadIcons} from '../utils/icons';

export class Chat extends BaseComponent {
  private chatsList: ChatsList;
  private friendRequests: FriendRequests;
  private discussion: Discussion;

  constructor() {
    super();
    this.chatsList = new ChatsList(this.store);
    this.friendRequests = new FriendRequests(this.store);
    this.discussion = new Discussion(this.store);
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
        'w-[400px] h-full flex-none border border-pink-300 rounded-xl flex flex-col',
    });

    const renderView = () => {
      container.innerHTML = '';
      const {chatView} = this.store.getState();
      let view: HTMLDivElement;

      switch (chatView.label) {
        case 'friendRequests':
          view = this.friendRequests.render();
          break;
        case 'chatsList':
          view = this.chatsList.render();
          break;
        default:
          view = this.discussion.render();
      }

      container.appendChild(view);
    };

    renderView();
    this.store.subscribeToPath('chatView', renderView);
    this.store.subscribe(loadIcons);
    return container;
  }
}
