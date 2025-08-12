import {DOMUtils} from '../../utils/dom';
import QRCode from 'qrcode';
import {Store} from '../../services/store';
import {Toastify} from '../../utils/toastify';
import {api} from '../../utils/Api';
import {createOTPInput} from '../../components/OTPInput';

export class TwoFactorAuthManager {
  constructor(
    private store: Store,
    private fetchAccount: () => void,
  ) {}

  private async removeTotp(secretToken: string) {
    const response = await api.delete('account/totp', {
      token: secretToken,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return response;
  }

  private async confirmTotp(secretToken: string) {
    const response = await api.put('account/totp', {
      token: secretToken,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message);
    }

    return response;
  }

  private async generateTotp() {
    try {
      const response = await api.get('account/totp');

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const data = await response.json();
      const qrcodeElement = document.getElementById('qrcode');

      if (qrcodeElement) {
        try {
          await QRCode.toCanvas(qrcodeElement, data.uri);
        } catch (error) {
          console.error('QR code generation failed:', error);
        }
      }

      this.store.setState({totpCode: data});
      return response;
    } catch (error) {
      console.error(error);
    }
  }

  private render2FADialog = (
    dialogContent: HTMLDivElement,
    closeDialog: () => void,
  ) => {
    dialogContent.innerHTML = '';

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

    this.generateTotp();

    const codeSection = DOMUtils.createElement('div', {
      className: 'bg-pink-300/20 rounded-lg p-2 mt-2 flex gap-2',
    });
    codeSection.appendChild(
      DOMUtils.createElement('canvas', {
        className: 'w-2/5 rounded bg-white',
        attributes: {
          id: 'qrcode',
        },
      }),
    );

    const codeHelper = DOMUtils.createElement('div', {
      className: 'max-w-[100%] flex-1 flex flex-col gap-2 p-4',
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

    const textCode = DOMUtils.createElement('div');

    const renderTextCode = () => {
      const code = this.store.getState().totpCode?.secret;
      textCode.innerHTML = '';
      textCode.className = 'relative flex justify-center text-wrap';

      const copiedToaster = DOMUtils.createElement('p', {
        className:
          'hidden bg-green-600 px-3 py-1 text-sm text-white absolute rounded top-10 duration-200',
        textContent: 'Secret code copied!',
      });

      const copyText = DOMUtils.createElement('p', {
        className:
          'px-2 py-1 bg-white text-background rounded cursor-pointer flex',
        textContent: code,
        events: {
          click: evt => {
            evt.preventDefault();
            navigator.clipboard.writeText(code ?? '');
            copiedToaster.style.display = 'block';
            setTimeout(() => {
              copiedToaster.style.display = 'none';
            }, 1000);
          },
        },
      });

      textCode.appendChild(copyText);
      textCode.appendChild(copiedToaster);
    };

    renderTextCode();
    this.store.subscribeToPath('totpCode.secret', () => renderTextCode());

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
        textContent: 'Get verification Code',
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
      className: 'text-red-500 font-light text-sm',
    });

    const {form, getValue} = createOTPInput();
    form.className = 'flex items-stretch w-fit justify-between mt-2';
    form.onsubmit = evt => {
      evt.preventDefault();
      this.confirmTotp(getValue())
        .then(() => {
          this.fetchAccount();
          closeDialog();
          Toastify.success('2 factor authentication activated');
        })
        .catch(response => {
          errorMessage.textContent = response;
        });
    };

    form.appendChild(
      DOMUtils.createElement('button', {
        className:
          'border border-pink-300 rounded px-4 hover:bg-pink-300/10 duration-200 cursor-pointer',
        textContent: 'Confirm',
        attributes: {
          type: 'submit',
        },
      }),
    );

    dialogContent.appendChild(form);
    dialogContent.appendChild(errorMessage);
  };

  private renderDeactivate2FADialog = (
    dialogContent: HTMLDivElement,
    closeDialog: () => void,
  ) => {
    dialogContent.innerHTML = '';

    dialogContent.appendChild(
      DOMUtils.createElement('h1', {
        className: 'text-3xl font-bold',
        textContent: 'Deactivate Authenticator App',
      }),
    );

    dialogContent.appendChild(
      DOMUtils.createElement('p', {
        className: 'w-100 font-light text-white/50 leading-tight mb-6',
        textContent:
          "Once disabled, you'll be able to sign in using only your username and password without any additional verification steps",
      }),
    );

    dialogContent.appendChild(
      DOMUtils.createElement('h2', {
        className: 'text-xl font-bold',
        textContent: 'Get verification Code',
      }),
    );
    dialogContent.appendChild(
      DOMUtils.createElement('h2', {
        className: 'w-100 text-sm font-light text-white/80 leading-tight mb-6',
        textContent:
          'Enter the 6-digit code you see in your authenticator app.',
      }),
    );

    const errorMessage = DOMUtils.createElement('p', {
      className: 'font-light text-red-500 text-sm',
    });

    const {form, getValue} = createOTPInput();
    form.className = 'flex justify-center items-stretch';
    form.appendChild(
      DOMUtils.createElement('button', {
        className:
          'px-4 border border-pink-300 ml-6 rounded hover:bg-pink-300/10 duration-200 cursor-pointer text-sm',
        textContent: 'Confirm',
        attributes: {
          type: 'submit',
        },
      }),
    );

    form.onsubmit = evt => {
      evt.preventDefault();
      const value = getValue();
      this.removeTotp(value)
        .then(() => {
          this.fetchAccount();
          closeDialog();
          Toastify.success('2 Factor Authentication deactivated');
        })
        .catch(response => {
          errorMessage.textContent = response;
        })
        .finally(() => closeDialog());
    };

    dialogContent.appendChild(form);
    dialogContent.appendChild(errorMessage);
  };

  render(
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
        textContent: '2 Factor Authorization',
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

    totpDialog.className =
      'p-10 bg-background text-white border border-white/50 rounded-xl';

    const renderToggle = (toggle: HTMLDivElement) => {
      const {user} = this.store.getState();

      toggle.innerHTML = '';
      toggle.className = `group w-10 h-6 flex items-center border ${user?.totp ? 'border-pink-300 bg-pink-300/20' : 'border-white/50'} rounded-full cursor-pointer duration-200`;
      toggle.onclick = evt => {
        evt.preventDefault();
        const {user} = this.store.getState();

        if (user && user?.totp) {
          // Deactivate
          showDialog();
          this.renderDeactivate2FADialog(totpDialog, closeDialog);
          // Call backend
        } else {
          // Activate
          showDialog();
          this.render2FADialog(totpDialog, closeDialog);
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
}
