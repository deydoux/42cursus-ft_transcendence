import {DOMUtils} from '../../utils/dom';
import {Router} from '../../services/router';
import {Store} from '../../services/store';
import {loadIcons} from '../../utils/icons';

export class UserCard {
  constructor(
    private store: Store,
    private router: Router,
  ) {}

  render(container: HTMLDivElement) {
    const {user} = this.store.getState();
    if (!user) return;

    const leftPart = DOMUtils.createElement('div', {
      className: 'flex items-center gap-4',
    });

    leftPart.appendChild(
      DOMUtils.createElement('img', {
        className: 'h-15 w-15 rounded-full',
        attributes: {
          src: user.avatar,
        },
      }),
    );

    const userInfos = DOMUtils.createElement('div');
    const renderUserInfos = () => {
      const {user, directChats} = this.store.getState();
      if (!user) return;

      userInfos.innerHTML = '';
      userInfos.appendChild(
        DOMUtils.createElement('p', {
          className: 'font-bold',
          textContent: user.username,
        }),
      );

      const userStats = DOMUtils.createElement('div', {
        className: '-mt-1 text-sm flex items-center text-white/60',
      });
      userStats.appendChild(
        DOMUtils.createElement('span', {
          textContent: `${directChats.length} friend${directChats.length > 1 ? 's' : ''} • ${user.elo ?? 300} `,
        }),
      );
      userStats.appendChild(
        DOMUtils.createElement('i', {
          className: 'w-3 h-3 ml-0.5',
          attributes: {
            icon: 'sparkles',
          },
        }),
      );

      userInfos.appendChild(userStats);
    };

    leftPart.appendChild(userInfos);
    renderUserInfos();
    this.store.subscribeToPath('directChats', renderUserInfos);

    const rightPart = DOMUtils.createElement('div', {
      className: 'flex items-center gap-4',
    });

    const isPlaying = ['/racecar', '/pong'].includes(location.pathname);

    const homepageButton = DOMUtils.createElement('button', {
      className: `rounded-full flex items-center p-2 justify-center border border-pink-300/10 ${isPlaying ? 'text-white/30' : 'hover:text-pink-300 hover:bg-pink-300/10 cursor-pointer'}  transition-all `,
      events: {
        click: () => this.router.navigate('/homepage'),
      },
    });
    homepageButton.disabled = isPlaying;
    homepageButton.appendChild(
      DOMUtils.createElement('i', {
        attributes: {
          icon: 'home',
        },
      }),
    );
    rightPart.appendChild(homepageButton);

    const settingsButton = DOMUtils.createElement('button', {
      className: `rounded-full flex items-center p-2 justify-center border border-pink-300/10 ${isPlaying ? 'text-white/30' : 'hover:text-pink-300 hover:bg-pink-300/10 cursor-pointer'}  transition-all `,
      events: {
        click: () => this.router.navigate('/settings'),
      },
    });
    settingsButton.disabled = isPlaying;
    settingsButton.appendChild(
      DOMUtils.createElement('i', {
        attributes: {
          icon: 'cog',
        },
      }),
    );
    rightPart.appendChild(settingsButton);

    container.appendChild(leftPart);
    container.appendChild(rightPart);

    this.store.subscribe(loadIcons);
    return container;
  }
}
