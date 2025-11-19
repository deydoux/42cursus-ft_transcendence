import {disconnectSession, fetchAccount} from '../api/account';
import {BaseComponent} from '../components/BaseComponent';
import {BlockList} from '../containers/settings/blockList';
import {PasswordManager} from '../containers/settings/passwordManager';
import {RGPD} from '../containers/settings/rgpd';
import {Sessions} from '../containers/settings/sessions';
import {TwoFactorAuthManager} from '../containers/settings/twoFactorAuthManager';
import {UserProfile} from '../containers/settings/userProfile';
import {createElement} from '../utils/dom';
import {logout} from '../api/authentication';

export class Settings extends BaseComponent {
  constructor(private chat: HTMLElement) {
    super();
  }

  private renderBanner() {
    const container = createElement('div', {
      className: `mb-8 w-full h-38 bg-linear-to-br from-pink-200 to-pink-300 text-background flex items-center justify-between px-16 rounded-lg  shadow-lg shadow-pink-300/30`,
    });

    const bannerTitle = createElement('div');
    bannerTitle.appendChild(
      createElement('h1', {
        className: 'text-3xl font-bold',
        textContent: 'Settings',
      }),
    );
    bannerTitle.appendChild(
      createElement('p', {
        className: 'opacity-70',
        textContent: 'Update your personal details and account settings.',
      }),
    );
    container.appendChild(bannerTitle);

    const logoutButton = createElement('button', {
      className: `bg-background text-pink-300 py-2 px-4 rounded-lg cursor-pointer duration-200 flex items-center gap-2`,
      onclick: logout,
    });

    logoutButton.appendChild(
      createElement('i', {
        className: 'w-5 h-5 -mt-0.5',
        icon: 'exit',
      }),
    );
    logoutButton.appendChild(
      createElement('p', {
        textContent: 'Logout',
      }),
    );

    container.appendChild(logoutButton);
    return container;
  }

  private renderSection(label: string, actionButton?: HTMLButtonElement) {
    const section = createElement('div', {
      className: `flex-1 p-4 bg-white/5 border border-white/20 gap-10 rounded-lg`,
    });

    const sectionHeader = createElement('div', {
      className: `flex items-center justify-between border-b border-white/20 pb-2`,
    });
    sectionHeader.appendChild(
      createElement('h2', {
        className: 'font-medium text-lg',
        textContent: label,
      }),
    );

    if (actionButton) sectionHeader.appendChild(actionButton);
    section.appendChild(sectionHeader);
    return section;
  }

  render(): HTMLElement {
    fetchAccount();

    const container = createElement('div', {
      className: 'flex h-full w-full gap-10',
    });

    const settings = createElement('div', {
      className: 'h-full flex-1 overflow-y-auto -mr-4 pr-4 space-y-8',
    });
    settings.appendChild(this.renderBanner());

    const row1 = createElement('div', {
      className: 'flex gap-8 flex-wrap',
    });

    // User Profile
    const userProfile = this.renderSection('Personal Information');
    userProfile.appendChild(this.createChild(UserProfile).render());
    row1.appendChild(userProfile);

    // Sessions
    const disconnectAllButton = createElement('button', {
      className: `rounded-lg text-white/80 hover:text-red-500 duration-100 cursor-pointer`,
      textContent: 'Disconnect All',
      onclick: () => disconnectSession(),
    });
    const sessions = this.renderSection('Sessions', disconnectAllButton);
    sessions.appendChild(this.createChild(Sessions).render());
    row1.appendChild(sessions);

    settings.appendChild(row1);

    // Change Password
    const changePassword = this.renderSection('Change Password');
    changePassword.appendChild(this.createChild(PasswordManager).render());
    settings.appendChild(changePassword);

    const row2 = createElement('div', {
      className: 'flex gap-8',
    });

    // Blocked users
    const blockedUsers = this.renderSection('Blocked users');
    blockedUsers.appendChild(this.createChild(BlockList).render());
    row2.appendChild(blockedUsers);

    // 2 Factor Authentication
    const preferences = this.renderSection('Account Management');
    preferences.appendChild(this.createChild(TwoFactorAuthManager).render());
    preferences.appendChild(this.createChild(RGPD).render());
    row2.appendChild(preferences);

    settings.appendChild(row2);

    container.appendChild(settings);
    if (this.chat) container.appendChild(this.chat);
    return container;
  }
}
