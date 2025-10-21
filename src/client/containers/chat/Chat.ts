import {BaseComponent} from '../../components/BaseComponent';
import {ChatsList} from './chatsList';
import {Discussion} from './discussion';
import {FriendRequests} from './friendRequests';
import {createElement} from '../../utils/dom';

export class Chat extends BaseComponent {
  private chatClass: BaseComponent | undefined;

  renderUserCard(container: HTMLDivElement) {
    const {user} = this.store.getState();
    if (!user) return createElement('div');
    container.innerHTML = '';

    const leftPart = createElement('div', {
      className: 'flex items-center gap-4',
    });

    leftPart.appendChild(
      createElement('img', {
        className: 'h-15 w-15 rounded-full',
        attributes: {
          src: user.avatar,
        },
      }),
    );

    const userInfos = createElement('div');
    const renderUserInfos = () => {
      const {user, directChats} = this.store.getState();
      if (!user) return;

      userInfos.innerHTML = '';
      userInfos.appendChild(
        createElement('p', {
          className: 'font-bold',
          textContent: user.username,
        }),
      );

      const userStats = createElement('div', {
        className: '-mt-1 text-sm flex items-center text-white/60',
      });
      userStats.appendChild(
        createElement('span', {
          textContent: `${directChats.length} friend${directChats.length > 1 ? 's' : ''} • ${user.elo ?? 300} `,
        }),
      );
      userStats.appendChild(
        createElement('i', {
          className: 'w-3 h-3 ml-0.5',
          icon: 'sparkles',
        }),
      );

      userInfos.appendChild(userStats);
    };

    leftPart.appendChild(userInfos);
    renderUserInfos();
    this.subscribeToPath('directChats', renderUserInfos);

    const rightPart = createElement('div', {
      className: 'flex items-center gap-4',
    });

    const isPlaying = ['/racecar', '/pong'].includes(location.pathname);

    const homepageButton = createElement('button', {
      className: `rounded-full flex items-center p-2 justify-center border border-pink-300/10 ${isPlaying ? 'text-white/30' : 'hover:text-pink-300 hover:bg-pink-300/10 cursor-pointer'}  transition-all `,
      onclick: () => this.router.navigate('/homepage'),
    });
    homepageButton.disabled = isPlaying;
    homepageButton.appendChild(
      createElement('i', {
        icon: 'home',
      }),
    );
    rightPart.appendChild(homepageButton);

    const settingsButton = createElement('button', {
      className: `rounded-full flex items-center p-2 justify-center border border-pink-300/10 ${isPlaying ? 'text-white/30' : 'hover:text-pink-300 hover:bg-pink-300/10 cursor-pointer'}  transition-all `,
      onclick: () => this.router.navigate('/settings'),
    });
    settingsButton.disabled = isPlaying;
    settingsButton.appendChild(
      createElement('i', {
        icon: 'cog',
      }),
    );
    rightPart.appendChild(settingsButton);

    container.appendChild(leftPart);
    container.appendChild(rightPart);
    return container;
  }

  render(): HTMLElement {
    const container = createElement('div', {
      className: `flex-none w-[400px] max-h-[100%] h-full overflow-hidden flex-none flex flex-col gap-4`,
    });

    // User card
    const usercard = createElement('div', {
      className: `flex-none flex items-center justify-between bg-linear-to-bl from-pink-300/5 to-pink-400/10 p-3 rounded-lg border border-pink-300/10`,
    });
    this.renderUserCard(usercard);
    this.subscribeToPath('user', () => this.renderUserCard(usercard));
    container.appendChild(usercard);

    // Chat view
    const view = createElement('div', {
      className: `flex-1 overflow-hidden border border-pink-300/50 rounded-xl flex flex-col`,
    });
    container.appendChild(view);
    const renderChatview = () => {
      const {chatView} = this.store.getState();

      view.innerHTML = '';
      if (this.chatClass) {
        this.chatClass.destroy();
        this.removeChild(this.chatClass);
      }

      if (chatView.label === 'friendRequests')
        this.chatClass = this.createChild(FriendRequests);
      else if (chatView.label === 'chatsList')
        this.chatClass = this.createChild(ChatsList);
      else this.chatClass = this.createChild(Discussion);

      view.appendChild(this.chatClass.render());
    };

    renderChatview();
    this.subscribeToPath('chatView', renderChatview);
    return container;
  }
}
