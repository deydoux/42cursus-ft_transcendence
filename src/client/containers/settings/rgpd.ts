import {DOMUtils} from '../../utils/dom';
import {Router} from '../../services/router';
import {Store} from '../../services/store';
import {Toastify} from '../../utils/toastify';
import {api} from '../../utils/Api';
import {createDialog} from '../../components/Dialog';
import {downloadResponse} from '../../utils/string';

export class RGPD {
  constructor(
    private router: Router,
    private store: Store,
  ) {}

  private async deleteAccount(
    password: string,
    errorMessage: HTMLParagraphElement,
  ) {
    try {
      const response = await api.delete('account', {password});

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      this.router.navigate('/');
      Toastify.success('Account deleted successfully');
    } catch (error) {
      errorMessage.textContent = error;
      console.error(error);
    }
  }

  private async downloadData() {
    try {
      const response = await api.get('account/dump');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const {user} = Store.getInstance().getState();
      if (!user) throw new Error('User is undefined');
      downloadResponse(`KittyPong-${user.username}-data.txt`, response);
    } catch (error) {
      Toastify.error('An error occured while downloading data');
      console.error(error);
    }
  }

  render() {
    const container = DOMUtils.createElement('div', {
      className: 'flex flex-col gap-4',
    });

    const retrieveData = DOMUtils.createElement('div', {
      className: 'flex items-center justify-between',
    });
    const retrieveDataLabel = DOMUtils.createElement('div');
    retrieveDataLabel.appendChild(
      DOMUtils.createElement('label', {
        textContent: 'Download your Data',
      }),
    );
    retrieveDataLabel.appendChild(
      DOMUtils.createElement('p', {
        className: 'text-sm font-light text-white/50 leading-tight',
        textContent: 'Request a copy of your account data.',
      }),
    );
    retrieveData.appendChild(retrieveDataLabel);

    retrieveData.appendChild(
      DOMUtils.createElement('button', {
        className:
          'px-4 py-2 rounded-lg border border-white/20 text-white/80 text-sm hover:bg-white/10 duration-200 cursor-pointer',
        textContent: 'Download',
        events: {
          click: this.downloadData,
        },
      }),
    );

    container.appendChild(retrieveData);

    const deleteAccount = DOMUtils.createElement('div', {
      className: 'flex items-center justify-between',
    });
    const deleteAccountLabel = DOMUtils.createElement('div');
    deleteAccountLabel.appendChild(
      DOMUtils.createElement('label', {
        textContent: 'Delete Account',
      }),
    );
    deleteAccountLabel.appendChild(
      DOMUtils.createElement('p', {
        className: 'text-sm font-light text-white/50 leading-tight',
        textContent: 'Permanently delete your account and data.',
      }),
    );
    deleteAccount.appendChild(deleteAccountLabel);

    const {dialogContent, showModal, close} = createDialog('delete-account');

    deleteAccount.appendChild(
      DOMUtils.createElement('button', {
        className:
          'px-4 py-2 rounded-lg border border-white/20 text-white/80 text-sm hover:bg-red-500/10 hover:border-red-500 hover:text-red-500 duration-100 cursor-pointer',
        textContent: 'Delete',
        events: {
          click: () => {
            showModal();
          },
        },
      }),
    );

    dialogContent.className =
      'bg-background border border-white/50 rounded-xl p-10 text-white max-w-130';

    dialogContent.appendChild(
      DOMUtils.createElement('h1', {
        className: 'text-3xl font-bold mb-4',
        textContent: 'Are you sure?',
      }),
    );
    dialogContent.appendChild(
      DOMUtils.createElement('p', {
        className: 'text-white/80',
        textContent:
          'By deleting your account, you will lose your data. This cannot be undone.',
      }),
    );
    dialogContent.appendChild(
      DOMUtils.createElement('p', {
        className: 'text-white/80 my-4',
        textContent:
          'Please enter your password to confirm your account deletion',
      }),
    );

    const errorMessage = DOMUtils.createElement('p', {
      className: 'text-red-500 text-sm',
    });

    const form = DOMUtils.createElement('form');
    form.onsubmit = evt => {
      evt.preventDefault();

      const formData = new FormData(evt.target as HTMLFormElement);
      this.deleteAccount(
        formData.get('password')?.toString() ?? '',
        errorMessage,
      );
    };
    form.appendChild(
      DOMUtils.createElement('input', {
        className:
          'change-password mt-1 border w-full border-pink-300/50 bg-background focus:border-white rounded-lg focus:outline-none px-3 py-2 placeholder:font-light placeholder:text-white/20',
        attributes: {
          name: 'password',
          type: 'password',
          placeholder: 'Your Password',
        },
      }),
    );
    form.appendChild(errorMessage);

    const buttons = DOMUtils.createElement('div', {
      className: 'flex items-center justify-end gap-4 mt-6',
    });
    buttons.appendChild(
      DOMUtils.createElement('button', {
        textContent: 'Cancel',
        className:
          'px-4 py-2 rounded-lg border border-white/20 text-white/80 text-sm hover:bg-white/10 duration-200 cursor-pointer',
        attributes: {
          type: 'button',
        },
        events: {
          click: () => close(),
        },
      }),
    );
    buttons.appendChild(
      DOMUtils.createElement('button', {
        textContent: 'Delete',
        className:
          'px-4 py-2 rounded-lg border border-red-500 text-red-500 text-sm hover:bg-red-500/10 duration-200 cursor-pointer',
        attributes: {
          type: 'submit',
        },
      }),
    );
    form.appendChild(buttons);

    dialogContent.appendChild(form);

    container.appendChild(deleteAccount);
    return container;
  }
}
