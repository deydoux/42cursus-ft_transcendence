import {DOMUtils} from '../../utils/dom';
import {Store} from '../../services/store';
import {Toastify} from '../../utils/toastify';
import {api} from '../../utils/Api';

export class UserProfile {
  avatarAcceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  avatarMaxSize = 5; // Mb

  constructor(
    private store: Store,
    private fetchAccount: () => void,
  ) {}

  private async updateAvatar(file: File) {
    try {
      const formData = new FormData();
      formData.append('avatar', file, file.name);
      const response = await api.customFetch('/api/account/avatar', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      this.fetchAccount();
      Toastify.success('Avatar updated successfully');
    } catch (error) {
      Toastify.error('An error occured while updloading the avatar');
      console.error(error);
    }
  }

  private async updateUsername(newUsername: string) {
    const response = await api.patch('account', {
      username: newUsername,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    await this.fetchAccount();
    Toastify.success('Username updated successfully');
  }

  private renderUsername(usernameSection: HTMLFormElement) {
    const {user} = this.store.getState();

    const headerContainer = DOMUtils.createElement('div', {
      className: 'w-full mb-1 flex justify-between items-end',
    });
    headerContainer.appendChild(
      DOMUtils.createElement('label', {
        className: 'text-sm font-bold',
        textContent: 'Username',
      }),
    );
    const errorField = DOMUtils.createElement('p', {
      className: 'text-sm font-light flex-1 text-red-500 text-right',
      attributes: {
        id: 'username-error-message',
      },
    });
    headerContainer.appendChild(errorField);

    usernameSection.innerHTML = '';
    usernameSection.className = 'flex flex-col';
    usernameSection.onsubmit = evt => {
      evt.preventDefault();

      const formData = new FormData(evt.target as HTMLFormElement);
      this.updateUsername(formData.get('username')?.toString() ?? '')
        .then(() => renderField())
        .catch(error => {
          errorField.textContent = error.toString().replace('Error: ', '');
        });
    };

    usernameSection.appendChild(headerContainer);

    const wrapper = DOMUtils.createElement('div', {
      className: 'w-full flex gap-2 h-10 justify-between items-center',
    });

    const renderEdit = () => {
      wrapper.innerHTML = '';
      const input = DOMUtils.createElement('input', {
        className:
          'bg-background border border-pink-300/50 focus:border-white rounded-lg flex-1 px-4 h-full focus:outline-none',
        attributes: {
          name: 'username',
          value: user?.username ?? '',
          autofocus: 'true',
          onfocus:
            "var temp_value=this.value; this.value=''; this.value=temp_value",
          placeholder: 'Username',
        },
      });

      const cancelButton = DOMUtils.createElement('button', {
        className:
          'border border-white/20 rounded-lg text-sm px-4 h-full cursor-pointer',
        textContent: 'Cancel',
        attributes: {
          type: 'button',
        },
        events: {
          click: evt => {
            evt.preventDefault();
            renderField();
          },
        },
      });

      const submitButton = DOMUtils.createElement('button', {
        className:
          'bg-pink-300/20 border border-pink-300 rounded-lg text-sm px-4 h-full cursor-pointer',
        textContent: 'Save',
        attributes: {
          type: 'submit',
        },
      });

      wrapper.appendChild(input);
      wrapper.appendChild(cancelButton);
      wrapper.appendChild(submitButton);
    };

    const renderField = () => {
      wrapper.innerHTML = '';
      const username = DOMUtils.createElement('p', {
        className:
          'bg-background px-4 h-full flex items-center border border-white/20 flex-1 rounded-lg',
        textContent: user?.username ?? '',
      });

      const button = DOMUtils.createElement('button', {
        className:
          'bg-background flex-none border border-pink-300 text-sm rounded-lg h-full px-4 hover:bg-pink-300/20 duration-200 cursor-pointer',
        textContent: 'Change username',
        events: {
          click: evt => {
            evt.preventDefault();
            renderEdit();
          },
        },
      });

      wrapper.appendChild(username);
      wrapper.appendChild(button);
    };

    renderField();
    usernameSection.appendChild(wrapper);
  }

  private renderAvatar(avatarSection: HTMLFormElement) {
    const {user} = this.store.getState();

    const fileInput = DOMUtils.createElement('input', {
      className: 'hidden file-input',
      attributes: {
        type: 'file',
        accept: 'image/jpeg,image/png,image/gif,image/webp',
        name: 'file',
      },
      events: {
        change: evt => {
          const target = evt.target as HTMLInputElement;
          const file = target.files?.[0];

          if (!file) return;

          if (!this.avatarAcceptedTypes.includes(file.type)) {
            console.error(
              `Please select a valid image file (${this.avatarAcceptedTypes.join(', ')})`,
            );
            return;
          }

          if (file.size > this.avatarMaxSize * 1024 * 1024) {
            console.error(
              `File size must be less than ${this.avatarMaxSize}MB`,
            );
            return;
          }

          this.updateAvatar(file);
          target.value = '';
        },
      },
    });

    avatarSection.innerHTML = '';
    avatarSection.className = 'py-4 flex items-center gap-6';
    avatarSection.onsubmit = evt => {
      evt.preventDefault();
      fileInput.click();
    };

    avatarSection.appendChild(
      DOMUtils.createElement('img', {
        className: 'w-20 h-20 rounded-full',
        attributes: {
          src: user?.avatar ?? '',
        },
      }),
    );

    avatarSection.appendChild(
      DOMUtils.createElement('button', {
        className:
          'flex-none bg-background border border-pink-300 text-sm rounded-lg h-full px-4 py-2 hover:bg-pink-300/20 duration-200 cursor-pointer',
        textContent: 'Change',
        attributes: {
          type: 'submit',
        },
      }),
    );

    avatarSection.appendChild(fileInput);
  }

  render() {
    const container = DOMUtils.createElement('div');

    // Edit the avatar
    const avatarSection = DOMUtils.createElement('form');
    container.appendChild(avatarSection);

    this.renderAvatar(avatarSection);
    this.store.subscribeToPath('user.avatar', () =>
      this.renderAvatar(avatarSection),
    );

    // Edit the username
    const usernameSection = DOMUtils.createElement('form');
    container.appendChild(usernameSection);

    this.renderUsername(usernameSection);
    this.store.subscribeToPath('user.username', () =>
      this.renderUsername(usernameSection),
    );

    return container;
  }
}
