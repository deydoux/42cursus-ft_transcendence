import {BaseComponent} from '../../components/BaseComponent';
import {ChatsList} from './chatsList';
import {Discussion} from './discussion';
import {FriendRequests} from './friendRequests';
import {GDPR} from '../../components/GDPR';
import {createDialog} from '../../components/Dialog';
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

    const userInfos = createElement('div', {
      className: 'relative cursor-default',
    });
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
        className: 'peer -mt-1 text-sm flex items-center text-white/60',
      });
      userStats.appendChild(
        createElement('span', {
          textContent: `${directChats.length} friend${directChats.length === 1 ? '' : 's'} • ${user.elo ?? 300} `,
        }),
      );
      userStats.appendChild(
        createElement('i', {
          className: 'w-3 h-3 ml-0.5',
          icon: 'sparkles',
        }),
      );

      const elos = createElement('div', {
        className: `absolute opacity-0 duration-100 peer-hover:opacity-100 top-10 py-2 px-4 w-30 text-center text-xs bg-background border border-white/20 rounded`,
      });

      elos.appendChild(
        createElement('p', {
          textContent: `Pong elo: ${user.elo}`,
        }),
      );
      elos.appendChild(
        createElement('p', {
          textContent: `Race elo: ${user.raceElo}`,
        }),
      );

      userInfos.appendChild(userStats);
      userInfos.appendChild(elos);
    };

    leftPart.appendChild(userInfos);
    renderUserInfos();
    this.subscribeToPath('directChats', renderUserInfos);

    const rightPart = createElement('div', {
      className: 'flex items-center gap-4',
    });

    const homepageButton = createElement('button', {
      className: `rounded-full flex items-center p-2 justify-center border border-pink-300/10 disabled:text-white/30 hover:text-pink-300 hover:bg-pink-300/10 cursor-pointer  transition-all `,
      onclick: () => this.router.navigate('/homepage'),
    });
    homepageButton.appendChild(
      createElement('i', {
        icon: 'home',
      }),
    );
    rightPart.appendChild(homepageButton);

    const settingsButton = createElement('button', {
      className: `rounded-full flex items-center p-2 justify-center border border-pink-300/10 disabled:text-white/30  hover:text-pink-300 hover:bg-pink-300/10 cursor-pointer  transition-all `,
      onclick: () => this.router.navigate('/settings'),
    });
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
    const {dialogContent, showModal} = createDialog('gdpr');
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

    const gdpr = this.createChild(GDPR);
    dialogContent.className = `p-10 bg-background text-white border border-white/50 rounded-xl max-w-200 h-9/10 overflow-y-auto`;
    dialogContent.appendChild(gdpr.render());

    const gdprText = createElement('p', {
      className: ' w-fit mx-auto text-white/30 text-xs ',
      textContent: 'Take a look at ',
    });

    const gdprLink = createElement('button', {
      className: `cursor-pointer hover:text-pink-300/80 duration-100 underline`,
      textContent: "Kitty Pong's privacy policy",
      onclick: evt => {
        evt.preventDefault();
        showModal();
        document
          .getElementById('ft_transcendence-privacy-policy')
          ?.scrollIntoView({block: 'end'});
      },
    });

    gdprText.appendChild(gdprLink);
    container.appendChild(gdprText);

    renderChatview();
    this.subscribeToPath('chatView', renderChatview);
    return container;
  }
}
