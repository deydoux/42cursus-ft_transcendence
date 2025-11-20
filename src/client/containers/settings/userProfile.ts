import {removeAvatar, updateAvatar, updateUsername} from '../../api/account';
import {BaseComponent} from '../../components/BaseComponent';
import {Toastify} from '../../utils/toastify';
import {createElement} from '../../utils/dom';

export class UserProfile extends BaseComponent {
  avatarAcceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  avatarMaxSize = 5 * 1024 * 1024; // MB

  private renderEditAvatar(form: HTMLFormElement) {
    const {user} = this.store.getState();
    if (!user) return;

    form.innerHTML = '';
    form.className = 'py-4 flex items-center gap-2';

    const fileInput = createElement('input', {
      className: 'hidden file-input',
      attributes: {
        type: 'file',
        name: 'file',
        accept: 'image/jpeg,image/png,image/gif,image/webp',
      },
    });
    fileInput.onchange = async evt => {
      const target = evt.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) return;

      if (!this.avatarAcceptedTypes.includes(file.type)) {
        const types = this.avatarAcceptedTypes.join(', ');
        Toastify.error(`Please select a valid image file (${types})`);
        return;
      }

      if (file.size > this.avatarMaxSize) {
        Toastify.error(`File size must be less than ${this.avatarMaxSize}MB`);
        return;
      }

      await updateAvatar(file);
      target.value = '';
    };

    form.appendChild(fileInput);
    form.onsubmit = evt => {
      evt.preventDefault();
      fileInput.click();
    };

    form.appendChild(
      createElement('img', {
        className: 'w-20 h-20 rounded-full',
        attributes: {
          src: user.avatar ?? '',
        },
      }),
    );

    const buttons = createElement('div', {
      className: 'ml-4 flex gap-2 flex-col xl:flex-row',
    });
    form.appendChild(buttons);

    buttons.appendChild(
      createElement('button', {
        className: `flex-none bg-background border border-pink-300 text-sm rounded-lg h-full px-4 py-2 hover:bg-pink-300/20 duration-200 cursor-pointer`,
        textContent: 'Change',
        attributes: {
          type: 'submit',
        },
      }),
    );

    if (user.hasAvatar) {
      buttons.appendChild(
        createElement('button', {
          className: `border border-white/20 rounded-lg text-sm px-4 py-2 cursor-pointer`,
          textContent: 'Remove',
          attributes: {
            type: 'button',
          },
          onclick: removeAvatar,
        }),
      );
    }

    return form;
  }

  private renderEditUsername(form: HTMLFormElement) {
    const {user} = this.store.getState();
    if (!user) return;

    form.innerHTML = '';
    form.className = 'flex flex-col';

    const errorField = createElement('p', {
      className: 'text-sm font-light flex-1 text-red-500 text-right',
    });

    form.onsubmit = async evt => {
      evt.preventDefault();

      const formData = new FormData(evt.target as HTMLFormElement);
      const newUsername = formData.get('username')?.toString() ?? '';

      const result = await updateUsername(newUsername);
      if (result.success) errorField.textContent = '';
      else errorField.textContent = result.error;
    };

    const label = createElement('div', {
      className: 'w-full mb-1 flex justify-between items-end',
    });
    label.appendChild(
      createElement('label', {
        className: 'text-sm font-bold',
        textContent: 'Username',
      }),
    );

    label.appendChild(errorField);
    form.appendChild(label);

    const container = createElement('div', {
      className: 'w-full flex gap-2 h-10 justify-between items-center',
    });

    const renderFieldMode = () => {
      container.innerHTML = '';
      const username = createElement('p', {
        className: `bg-background px-4 h-full flex items-center border border-white/20 flex-1 rounded-lg`,
        textContent: user.username,
      });

      const button = createElement('button', {
        className: `bg-background flex-none border border-pink-300 text-sm rounded-lg h-full px-4 hover:bg-pink-300/20 duration-200 cursor-pointer`,
        textContent: 'Change',
        onclick: renderEditMode,
        attributes: {
          type: 'button',
        },
      });

      container.appendChild(username);
      container.appendChild(button);
    };

    const renderEditMode = () => {
      container.innerHTML = '';
      const input = createElement('input', {
        className: `bg-background border border-pink-300/50 focus:border-white rounded-lg flex-1 px-4 h-full focus:outline-none`,
        attributes: {
          name: 'username',
          value: user.username,
          autofocus: 'true',
          onfocus: `var temp_value=this.value; this.value=''; this.value=temp_value`,
          placeholder: 'Username',
        },
      });

      const cancelButton = createElement('button', {
        className: `border border-white/20 rounded-lg text-sm px-4 h-full cursor-pointer`,
        textContent: 'Cancel',
        onclick: renderFieldMode,
        attributes: {
          type: 'button',
        },
      });

      const submitButton = createElement('button', {
        className: `bg-pink-300/20 border border-pink-300 rounded-lg text-sm px-4 h-full cursor-pointer`,
        textContent: 'Save',
        attributes: {
          type: 'submit',
        },
      });

      container.appendChild(input);
      container.appendChild(cancelButton);
      container.appendChild(submitButton);
    };

    renderFieldMode();
    form.appendChild(container);
  }

  render(): HTMLElement {
    const container = createElement('div');

    // Edit the avatar
    const avatar = createElement('form');
    container.appendChild(avatar);

    this.renderEditAvatar(avatar);
    this.subscribeToPath('user.avatar', () => this.renderEditAvatar(avatar));

    // Edit the username
    const username = createElement('form');
    container.appendChild(username);

    this.renderEditUsername(username);
    this.subscribeToPath('user.username', () => {
      this.renderEditUsername(username);
    });

    return container;
  }
}
