import {deleteAccount, downloadData} from '../../api/account';
import {BaseComponent} from '../../components/BaseComponent';
import {createDialog} from '../../components/Dialog';
import {createElement} from '../../utils/dom';

export class RGPD extends BaseComponent {
  render() {
    const container = createElement('div', {
      className: 'flex flex-col gap-4',
    });

    const retrieveData = createElement('div', {
      className: 'flex items-center justify-between',
    });
    const retrieveDataLabel = createElement('div');
    retrieveDataLabel.appendChild(
      createElement('label', {
        textContent: 'Download your Data',
      }),
    );
    retrieveDataLabel.appendChild(
      createElement('p', {
        className: 'text-sm font-light text-white/50 leading-tight',
        textContent: 'Request a copy of your account data.',
      }),
    );
    retrieveData.appendChild(retrieveDataLabel);

    retrieveData.appendChild(
      createElement('button', {
        className: `px-4 py-2 rounded-lg border border-white/20 text-white/80 text-sm hover:bg-white/10 duration-200 cursor-pointer`,
        textContent: 'Download',
        onclick: downloadData,
      }),
    );

    container.appendChild(retrieveData);

    const deleteAccountElement = createElement('div', {
      className: 'flex items-center justify-between',
    });
    const deleteAccountLabel = createElement('div');
    deleteAccountLabel.appendChild(
      createElement('label', {
        textContent: 'Delete Account',
      }),
    );
    deleteAccountLabel.appendChild(
      createElement('p', {
        className: 'text-sm font-light text-white/50 leading-tight',
        textContent: 'Permanently delete your account and data.',
      }),
    );
    deleteAccountElement.appendChild(deleteAccountLabel);

    const {dialogContent, showModal, close} = createDialog('delete-account');

    deleteAccountElement.appendChild(
      createElement('button', {
        className: `px-4 py-2 rounded-lg border border-white/20 text-white/80 text-sm hover:bg-red-500/10 hover:border-red-500 hover:text-red-500 duration-100 cursor-pointer`,
        textContent: 'Delete',
        onclick: showModal,
      }),
    );

    dialogContent.className = `bg-background border border-white/50 rounded-xl p-10 text-white max-w-130`;

    dialogContent.appendChild(
      createElement('h1', {
        className: 'text-3xl font-bold mb-4',
        textContent: 'Are you sure?',
      }),
    );
    dialogContent.appendChild(
      createElement('p', {
        className: 'text-white/80',
        textContent: `By deleting your account, you will lose your data. This cannot be undone.`,
      }),
    );
    dialogContent.appendChild(
      createElement('p', {
        className: 'text-white/80 my-4',
        textContent: `Please enter your password to confirm your account deletion`,
      }),
    );

    const errorMessage = createElement('p', {
      className: 'text-red-500 text-sm',
    });

    const form = createElement('form');
    form.onsubmit = async evt => {
      evt.preventDefault();
      const formData = new FormData(evt.target as HTMLFormElement);
      const password = formData.get('password')?.toString() ?? '';

      const result = await deleteAccount(password);
      if (result.success) this.router.navigate('/');
      else errorMessage.textContent = result.error;
    };
    form.appendChild(
      createElement('input', {
        className: `mt-1 border w-full border-pink-300/50 bg-background focus:border-white rounded-lg focus:outline-none px-3 py-2 placeholder:font-light placeholder:text-white/20`,
        attributes: {
          name: 'password',
          type: 'password',
          placeholder: 'Your Password',
        },
      }),
    );
    form.appendChild(errorMessage);

    const buttons = createElement('div', {
      className: 'flex items-center justify-end gap-4 mt-6',
    });
    buttons.appendChild(
      createElement('button', {
        textContent: 'Cancel',
        className: `px-4 py-2 rounded-lg border border-white/20 text-white/80 text-sm hover:bg-white/10 duration-200 cursor-pointer`,
        onclick: close,
        attributes: {
          type: 'button',
        },
      }),
    );
    buttons.appendChild(
      createElement('button', {
        textContent: 'Delete',
        className: `px-4 py-2 rounded-lg border border-red-500 text-red-500 text-sm hover:bg-red-500/10 duration-200 cursor-pointer`,
        attributes: {
          type: 'submit',
        },
      }),
    );
    form.appendChild(buttons);

    dialogContent.appendChild(form);
    container.appendChild(deleteAccountElement);
    return container;
  }
}
