import {BaseComponent} from '../components/BaseComponent';
import {BlockList} from '../containers/settings/blockList';
import {Chat} from '../containers/Chat';
import {DOMUtils} from '../utils/dom';
import {PasswordManager} from '../containers/settings/passwordManager';
import {RGPD} from '../containers/settings/rgpd';
import {Sessions} from '../containers/settings/sessions';
import {Toastify} from '../utils/toastify';
import {TwoFactorAuthManager} from '../containers/settings/twoFactorAuthManager';
import {UserProfile} from '../containers/settings/userProfile';
import {api} from '../utils/Api';
import {createDialog} from '../components/Dialog';

export class Settings extends BaseComponent {
  private UserProfile: UserProfile;
  private TwoFactorAuthManager: TwoFactorAuthManager;
  private PasswordManager: PasswordManager;
  private BlockList: BlockList;
  private Sessions: Sessions;
  private RGPD: RGPD;

  constructor() {
    super();
    this.RGPD = new RGPD(this.router);
    this.Sessions = new Sessions(this.store);
    this.BlockList = new BlockList(this.store);
    this.PasswordManager = new PasswordManager();
    this.UserProfile = new UserProfile(this.store, this.fetchAccount);
    this.TwoFactorAuthManager = new TwoFactorAuthManager(
      this.store,
      this.fetchAccount,
    );
  }

  private async fetchAccount() {
    try {
      const response = await api.get('account');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const data = await response.json();
      this.store.setState({user: data});
    } catch (error) {
      Toastify.error('An error occurred while fetching user account');
      console.error(error);
    }
  }

  private renderHeader() {
    const container = DOMUtils.createElement('div', {
      className:
        'mb-8 w-full h-38 bg-linear-to-br from-pink-200 to-pink-300 text-background flex items-center justify-between px-16 rounded-lg  shadow-lg shadow-pink-300/30',
    });

    const headerTitle = DOMUtils.createElement('div');

    headerTitle.appendChild(
      DOMUtils.createElement('h1', {
        className: 'text-3xl font-bold',
        textContent: 'Settings',
      }),
    );
    headerTitle.appendChild(
      DOMUtils.createElement('p', {
        className: 'opacity-70',
        textContent: 'Update your personal details and account settings.',
      }),
    );

    container.appendChild(headerTitle);

    const logoutButton = DOMUtils.createElement('button', {
      className:
        'bg-background text-pink-300 py-2 px-4 rounded-lg cursor-pointer duration-200 flex items-center gap-2',
      events: {
        click: async () => {
          await api.post('auth/logout', {});
          localStorage.removeItem('accessToken');
          this.router.navigate('/');
        },
      },
    });

    logoutButton.appendChild(
      DOMUtils.createElement('i', {
        className: 'w-5 h-5 -mt-0.5',
        attributes: {
          icon: 'exit',
        },
      }),
    );
    logoutButton.appendChild(
      DOMUtils.createElement('p', {
        textContent: 'Logout',
      }),
    );

    container.appendChild(logoutButton);
    return container;
  }

  render(): HTMLElement | undefined {
    this.fetchAccount();

    const container = DOMUtils.createElement('div', {
      className: 'w-screen h-screen flex items-center gap-10 py-16',
    });
    const settings = DOMUtils.createElement('div', {
      className: 'h-full flex-1 overflow-y-auto -mr-4 pr-4',
    });

    // Header
    settings.appendChild(this.renderHeader());

    const renderBlock = (label: string, headerButton?: HTMLButtonElement) => {
      const block = DOMUtils.createElement('div', {
        className:
          'flex-1 p-4 bg-white/5 border border-white/20 gap-10 rounded-lg',
      });

      const header = DOMUtils.createElement('div', {
        className:
          'flex items-center justify-between border-b border-white/20 pb-2',
      });

      header.appendChild(
        DOMUtils.createElement('h2', {
          className: 'font-medium text-lg',
          textContent: label,
        }),
      );
      if (headerButton) {
        header.appendChild(headerButton);
      }

      block.appendChild(header);
      return block;
    };

    const firstRow = DOMUtils.createElement('div', {
      className: 'flex gap-8 mb-8',
    });

    // User Profile
    const userProfile = renderBlock('Personal Information');
    userProfile.appendChild(this.UserProfile.render());

    // Activate / Deactivate 2FA
    const disconnectAllButton = DOMUtils.createElement('button', {
      className:
        'rounded-lg text-white/80 hover:text-red-500 duration-100 cursor-pointer',
      textContent: 'Disconnect All',
    });
    const sessions = renderBlock('Sessions', disconnectAllButton);
    sessions.appendChild(this.Sessions.render(disconnectAllButton));

    firstRow.appendChild(userProfile);
    firstRow.appendChild(sessions);
    settings.appendChild(firstRow);

    // Change Password
    const changePassword = renderBlock('Change Password');
    changePassword.appendChild(this.PasswordManager.render());
    settings.appendChild(changePassword);

    const thirdRow = DOMUtils.createElement('div', {
      className: 'flex gap-8 mt-8',
    });

    // Block list
    const blockList = renderBlock('Blocked users');
    blockList.appendChild(this.BlockList.render());
    settings.appendChild(blockList);

    // Sesssions

    const preferences = renderBlock('Account Management');
    const {dialogContent, showModal, close} = createDialog('2fa');
    preferences.appendChild(
      this.TwoFactorAuthManager.render(dialogContent, showModal, close),
    );
    preferences.appendChild(this.RGPD.render());

    thirdRow.appendChild(blockList);
    thirdRow.appendChild(preferences);
    settings.appendChild(thirdRow);

    container.appendChild(settings);

    const chat = new Chat().render();
    if (chat) container.appendChild(chat);
    return container;
  }
}
