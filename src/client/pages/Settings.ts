import {BaseComponent} from '../components/BaseComponent';
import {Chat} from '../containers/Chat';
import {DOMUtils} from '../utils/dom';
import {Toastify} from '../utils/toastify';
import {api} from '../utils/Api';
import {createDialog} from '../components/Dialog';
import {loadIcons} from '../utils/icons';

export class Settings extends BaseComponent {
  avatarAcceptedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  avatarMaxSize = 5; // Mb

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
      Toastify.error('An error occured while fetching user account');
      console.error(error);
    }
  }

  private async updateAvatar(file: File) {
    try {
      const formData = new FormData();
      formData.append('avatar', file, file.name);
      const response = await api.put('account/avatar', formData);

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

  private async updatePassword(
    oldPassword: string,
    password: string,
    confirmPassword: string,
    errorField: HTMLParagraphElement,
  ) {
    try {
      const response = await api.patch('account', {
        oldPassword,
        password,
        confirmPassword,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      document
        .querySelectorAll('input.change-password')
        .forEach(input => ((input as HTMLInputElement).value = ''));
      const button = document.querySelector(
        'button#change-password',
      ) as HTMLButtonElement;
      button.disabled = true;

      Toastify.success('Password updated successfully');
    } catch (error) {
      errorField.textContent = error.toString().replaceAll('Error: ', '');
      console.error(error);
    }
  }

  private async confirmTotp(secretToken: string) {
    const response = await api.post('account/totp', {
      token: secretToken,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return response;
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

    // <input type="file" class="file-input" accept="${this.options.acceptedTypes.join(',')}" />
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

  private renderNewPasswordForm() {
    const container = DOMUtils.createElement('form', {
      className: 'flex flex-col',
      events: {
        submit: evt => {
          evt.preventDefault();
          const formData = new FormData(evt.target as HTMLFormElement);
          const formDataObj = {
            oldpassword: '',
            newpassword: '',
            newpasswordagain: '',
          };
          formData.forEach((value, key) => (formDataObj[key] = value));

          const errorField = document.querySelector(
            'p#password-error-message',
          ) as HTMLParagraphElement;
          errorField.textContent = '';
          if (formDataObj.newpassword !== formDataObj.newpasswordagain) {
            errorField.textContent = 'The two passwords must be the same';
            return;
          }

          this.updatePassword(
            formDataObj.oldpassword,
            formDataObj.newpassword,
            formDataObj.newpasswordagain,
            errorField,
          );
        },
      },
    });

    const checkInputs = () => {
      const allFilled = [
        ...document.querySelectorAll('input.change-password'),
      ].every(i => (i as HTMLInputElement).value);
      const saveButton = document.querySelector(
        'button#change-password',
      ) as HTMLButtonElement;
      if (saveButton) saveButton.disabled = !allFilled;
    };

    const renderPasswordField = (label: string) => {
      const password = DOMUtils.createElement('div', {
        className: 'flex-1',
      });
      password.appendChild(
        DOMUtils.createElement('label', {
          className: 'font-semibold mb-1 text-sm',
          textContent: label,
        }),
      );
      password.appendChild(
        DOMUtils.createElement('input', {
          className:
            'change-password mt-1 border w-full border-pink-300/50 bg-background focus:border-white rounded-lg focus:outline-none px-3 py-2 placeholder:font-light placeholder:text-white/20',
          attributes: {
            type: 'password',
            name: label.toLowerCase().replaceAll(' ', ''),
            placeholder: 'Enter your password',
          },
          events: {
            input: () => checkInputs(),
          },
        }),
      );
      return password;
    };

    const passwordsWrapper = DOMUtils.createElement('div', {
      className: 'w-full flex items-center gap-4 pt-4',
    });

    passwordsWrapper.appendChild(renderPasswordField('Old Password'));
    passwordsWrapper.appendChild(renderPasswordField('New Password'));
    passwordsWrapper.appendChild(renderPasswordField('New Password Again'));

    container.appendChild(passwordsWrapper);

    const submitWrapper = DOMUtils.createElement('div', {
      className: 'mt-4 w-full flex items-start justify-end gap-4',
    });
    submitWrapper.appendChild(
      DOMUtils.createElement('p', {
        className:
          'text-red-500 font-light text-sm max-w-[400px] text-right leading-tight flex mt-0.5',
        attributes: {
          id: 'password-error-message',
        },
      }),
    );
    submitWrapper.appendChild(
      DOMUtils.createElement('button', {
        textContent: 'Save New Password',
        className:
          'flex-none border border-pink-300 text-sm rounded-lg h-full px-4 py-2 bg-pink-300/20 duration-200 cursor-pointer disabled:text-white/50 disabled:border-white/30 disabled:bg-background disabled:cursor-default',
        attributes: {
          id: 'change-password',
          disabled: 'true',
          type: 'submit',
        },
      }),
    );

    container.appendChild(submitWrapper);
    return container;
  }

  private render2FADialog = (
    dialogContent: HTMLDivElement,
    closeDialog: () => void,
  ) => {
    dialogContent.innerHTML = '';
    dialogContent.className =
      'p-10 bg-background text-white border border-white/50 rounded-xl';

    dialogContent.appendChild(
      DOMUtils.createElement('h1', {
        className: 'text-3xl font-bold',
        textContent: 'Setup Authenticator App',
      }),
    );
    dialogContent.appendChild(
      DOMUtils.createElement('p', {
        className: 'mt-2 text-white/50 font-light max-w-120 leading-tight',
        textContent:
          "Each time you log in, in addition to your password, you'll use an authenticator app to generate a one-time code.",
      }),
    );

    const step1Header = DOMUtils.createElement('div', {
      className: 'flex items-center mt-6',
    });
    step1Header.appendChild(
      DOMUtils.createElement('span', {
        className:
          'text-sm font-light border border-pink-300 rounded-full px-2 py-0.5 bg-pink-300/10 text-pink-300',
        textContent: 'Step 1',
      }),
    );
    step1Header.appendChild(
      DOMUtils.createElement('h2', {
        className: 'font-medium ml-3 text-xl',
        textContent: 'Scan QR code',
      }),
    );
    dialogContent.appendChild(step1Header);

    dialogContent.appendChild(
      DOMUtils.createElement('p', {
        className: 'mt-2 text-white/80 font-light max-w-100 leading-tight',
        textContent:
          'Scan the QR code below or manually enter the secret key into your authenticator app.',
      }),
    );

    // Generate QR Code GET /api/account/totp

    const codeSection = DOMUtils.createElement('div', {
      className: 'w-120 bg-pink-300/20 rounded-lg p-2 mt-2 flex gap-2',
    });
    codeSection.appendChild(
      DOMUtils.createElement('img', {
        className: 'w-2/5 rounded',
        attributes: {
          src: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6a/QRcode_Wikipedia_FRA.png/1200px-QRcode_Wikipedia_FRA.png',
        },
      }),
    );

    const codeHelper = DOMUtils.createElement('div', {
      className: 'flex-1 flex flex-col gap-2 p-4',
    });
    codeHelper.appendChild(
      DOMUtils.createElement('p', {
        textContent: "Can't scan QR code?",
      }),
    );
    codeHelper.appendChild(
      DOMUtils.createElement('p', {
        className: 'text-white/80 font-light',
        textContent: 'Enter this secret instead:',
      }),
    );
    const textCode = DOMUtils.createElement('div', {
      className: 'relative flex items-center',
    });

    const code = 'ZPFIY52GITG7WOWJ44';

    const copiedToaster = DOMUtils.createElement('p', {
      className:
        'hidden bg-green-600 px-3 py-1 text-sm text-white absolute rounded top-10 duration-200 right-12',
      textContent: 'Secret code copied!',
    });

    const copyText = DOMUtils.createElement('p', {
      className:
        'relative px-2 py-1 bg-white/90 text-background w-full rounded cursor-pointer flex',
      textContent: code,
      events: {
        click: evt => {
          evt.preventDefault();
          navigator.clipboard.writeText(code);
          copiedToaster.style.display = 'block';
          setTimeout(() => {
            copiedToaster.style.display = 'none';
          }, 1000);
        },
      },
    });
    textCode.appendChild(copyText);
    textCode.appendChild(
      DOMUtils.createElement('i', {
        className: 'w-4 h-4 absolute text-black right-2 cursor-pointer',
        attributes: {
          icon: 'clipboard',
        },
      }),
    );

    copyText.appendChild(copiedToaster);
    codeHelper.appendChild(textCode);
    codeSection.appendChild(codeHelper);
    dialogContent.appendChild(codeSection);

    const step2Header = DOMUtils.createElement('div', {
      className: 'flex items-center mt-6',
    });
    step2Header.appendChild(
      DOMUtils.createElement('span', {
        className:
          'text-sm font-light border border-pink-300 rounded-full px-2 py-0.5 bg-pink-300/10 text-pink-300',
        textContent: 'Step 2',
      }),
    );
    step2Header.appendChild(
      DOMUtils.createElement('h2', {
        className: 'font-medium ml-3 text-xl',
        textContent: 'Get verfication Code',
      }),
    );
    dialogContent.appendChild(step2Header);

    dialogContent.appendChild(
      DOMUtils.createElement('p', {
        className: 'mt-2 text-white/80 font-light leading-tight',
        textContent:
          'Enter the 6-digit code you see in your authenticator app.',
      }),
    );

    const errorMessage = DOMUtils.createElement('p', {
      className: 'text-red-500 font-light',
    });

    const codeForm = DOMUtils.createElement('form', {
      className: 'flex items-stretch justify-between mt-2 gap-4',
      events: {
        submit: evt => {
          evt.preventDefault();
          const formData = new FormData(evt.target as HTMLFormElement);
          const body = Object.fromEntries(formData);
          this.confirmTotp(body.token as string)
            .then(() => {
              this.fetchAccount();
              closeDialog();
              Toastify.success('2 factor authentication activated');
            })
            .catch(response => {
              errorMessage.textContent = response;
            });
        },
      },
    });

    const verificationCode = DOMUtils.createElement('input', {
      className:
        'border flex-1 border-pink-300/50 focus:outline-none focus:border-white px-2 py-1 rounded placeholder:font-light',
      attributes: {
        placeholder: '000 000',
        name: 'token',
      },
    });

    codeForm.appendChild(verificationCode);
    codeForm.appendChild(
      DOMUtils.createElement('button', {
        className:
          ' border border-pink-300 rounded px-4 hover:bg-pink-300/10 duration-200 cursor-pointer',
        textContent: 'Confirm',
        attributes: {
          type: 'submit',
        },
      }),
    );

    dialogContent.appendChild(codeForm);
    dialogContent.appendChild(errorMessage);
    loadIcons();
  };

  private render2FAToggle(
    totpDialog: HTMLDivElement,
    showDialog: () => void,
    closeDialog: () => void,
  ) {
    const container = DOMUtils.createElement('div', {
      className: 'flex items-center justify-between py-4',
    });

    const label = DOMUtils.createElement('div', {
      className: 'flex flex-col w-2/3',
    });

    label.appendChild(
      DOMUtils.createElement('label', {
        textContent: '2-step verification',
        className: '2-step verification',
      }),
    );
    label.appendChild(
      DOMUtils.createElement('p', {
        className: 'text-sm font-light text-white/50 leading-tight',
        textContent:
          'An extra layer of protection to your Kitty Pong account during login',
      }),
    );

    container.appendChild(label);

    const renderToggle = (toggle: HTMLDivElement) => {
      const {user} = this.store.getState();

      toggle.innerHTML = '';
      toggle.className = `group w-10 h-6 flex items-center border ${user?.totp ? 'border-pink-300 bg-pink-300/20' : 'border-white/50'} rounded-full cursor-pointer duration-200`;
      toggle.onclick = evt => {
        evt.preventDefault();
        const {user} = this.store.getState();

        if (user && user?.totp) {
          // Deactivate
          this.store.setState({user: {...user, totp: false}});
        } else {
          // Activate
          showDialog();
          this.render2FADialog(totpDialog);
        }
      };

      toggle.appendChild(
        DOMUtils.createElement('div', {
          className: `w-4 h-4 rounded-full ${user?.totp ? 'bg-pink-300 translate-x-[14px]' : 'bg-white/70 group-hover:bg-white'} ml-1 duration-200`,
        }),
      );
    };

    const toggle = DOMUtils.createElement('div');
    container.appendChild(toggle);
    renderToggle(toggle);
    this.store.subscribeToPath('user.totp', () => renderToggle(toggle));

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

    settings.appendChild(
      DOMUtils.createElement('button', {
        textContent: 'Return to homepage',
        className: 'hover:underline cursor-pointer',
        events: {
          click: () => {
            this.router.navigate('/homepage');
          },
        },
      }),
    );

    settings.appendChild(
      DOMUtils.createElement('h1', {
        textContent: 'Settings',
        className: 'text-3xl font-bold my-4 uppercase',
      }),
    );

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

    // Edit the avatar
    const avatarSection = DOMUtils.createElement('form');
    userProfile.appendChild(avatarSection);

    this.renderAvatar(avatarSection);
    this.store.subscribeToPath('user.avatar', () =>
      this.renderAvatar(avatarSection),
    );

    // Edit the username
    const usernameSection = DOMUtils.createElement('form');
    userProfile.appendChild(usernameSection);

    this.renderUsername(usernameSection);
    this.store.subscribeToPath('user.username', () =>
      this.renderUsername(usernameSection),
    );

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
      this.render2FAToggle(dialogContent, showModal, close),
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
    changePassword.appendChild(this.renderNewPasswordForm());
    settings.appendChild(changePassword);

    container.appendChild(settings);
    const chat = new Chat().render();
    if (chat) container.appendChild(chat);
    return container;
  }
}
