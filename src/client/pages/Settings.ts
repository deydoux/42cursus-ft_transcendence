import {BaseComponent} from '../components/BaseComponent';
import {Chat} from '../containers/Chat';
import {DOMUtils} from '../utils/dom';
import {PasswordManager} from '../containers/settings/passwordManager';
import {Toastify} from '../utils/toastify';
import {TwoFactorAuthManager} from '../containers/settings/twoFactorAuthManager';
import {UserProfile} from '../containers/settings/userProfile';
import {api} from '../utils/Api';
import {createDialog} from '../components/Dialog';
import {html} from '../utils/html';

export class Settings extends BaseComponent {
  private UserProfile: UserProfile;
  private TwoFactorAuthManager: TwoFactorAuthManager;
  private PasswordManager: PasswordManager;

  constructor() {
    super();
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
      className: 'flex items-center justify-between pb-6',
    });

    const headerLeft = DOMUtils.createElement('div', {
      className: 'flex items-center justify-center gap-4',
    });

    const backIcon = DOMUtils.createElement('button', {
      className:
        'w-6 h-6 mb-1 flex items-center justify-center rounded-full border p-0.5 border-pink-300 cursor-pointer',
      events: {
        click: () => {
          this.router.navigate('/homepage');
        },
      },
    });

    backIcon.appendChild(
      DOMUtils.createElement('i', {
        className: 'w-4 h-4',
        attributes: {
          icon: 'leftArrow',
        },
      }),
    );
    headerLeft.appendChild(backIcon);

    const headerText = DOMUtils.createElement('div', {
      className: 'flex flex-col justify-center items-start gap',
    });
    headerText.appendChild(
      html`<h1
        class="settings-title text-4xl font-bold text-white/10 uppercase"
      >
        <span>S</span>end m<span>e</span> ki<span>tt</span>y th<span>ings</span>
      </h1>`,
    );
    headerLeft.appendChild(headerText);

    container.appendChild(headerLeft);

    const logoutButton = DOMUtils.createElement('button', {
      className:
        'border border-pink-300 py-2 px-4 rounded-lg cursor-pointer hover:bg-pink-300/10 duration-200',
      textContent: 'Logout',
      events: {
        click: async () => {
          await api.post('auth/logout', {});
          localStorage.removeItem('accessToken');
          this.router.navigate('/');
        },
      },
    });

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

    // User Profile
    const firstRow = DOMUtils.createElement('div', {
      className: 'flex gap-8 mb-8',
    });
    const userProfile = DOMUtils.createElement('div', {
      className:
        'flex-1 p-4 bg-white/5 border border-white/20 gap-10 rounded-lg',
    });

    const userProfileHeader = DOMUtils.createElement('h2', {
      className: 'font-medium text-lg border-b border-white/20 pb-2',
      textContent: 'Personal Information',
    });

    userProfile.appendChild(userProfileHeader);
    userProfile.appendChild(this.UserProfile.render());

    // Activate / Deactivate 2FA
    const preferences = DOMUtils.createElement('div', {
      className: 'flex-1 p-4 border bg-white/5 border-white/20 rounded-lg',
    });

    preferences.appendChild(
      DOMUtils.createElement('h2', {
        className: 'font-medium text-lg border-b border-white/20 pb-2',
        textContent: 'Preferences',
      }),
    );

    const {dialogContent, showModal, close} = createDialog('2fa');
    preferences.appendChild(
      this.TwoFactorAuthManager.render(dialogContent, showModal, close),
    );

    firstRow.appendChild(userProfile);
    firstRow.appendChild(preferences);
    settings.appendChild(firstRow);

    // Change Password
    const changePassword = DOMUtils.createElement('div', {
      className: 'p-4 border bg-white/5 border-white/20 gap-10 rounded-lg',
    });

    const changePasswordHeader = DOMUtils.createElement('h2', {
      className: 'font-medium text-lg border-b border-white/20 pb-2',
      textContent: 'Change Password',
    });

    changePassword.appendChild(changePasswordHeader);
    changePassword.appendChild(this.PasswordManager.render());
    settings.appendChild(changePassword);

    container.appendChild(settings);
    const chat = new Chat().render();
    if (chat) container.appendChild(chat);
    return container;
  }
}
