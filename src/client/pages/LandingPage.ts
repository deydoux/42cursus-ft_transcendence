import '../styles/main.css';
import {register, verifyTOTP} from '../api/authentication';
import {BaseComponent} from '../components/BaseComponent';
import {Toastify} from '../utils/toastify';
import {createDialog} from '../components/Dialog';
import {createElement} from '../utils/dom';
import {createOTPInput} from '../components/OTPInput';
import {fetchPublicKPIs} from '../api/account';
import {gdpr} from '../containers/chat/gdpr';
import img from '../assets/kittypong.png';
import {loadIcons} from '../utils/icons';
import sticker from '../assets/sticker.png';

declare const __GOOGLE_ID__: string;

export class LandingPage extends BaseComponent {
  private gdprDialogOpened = false;
  private authDialogContent: HTMLDivElement;
  private totpAccessToken: string;
  private googleSignin: HTMLElement | null = null;

  private cleanupGoogleIdentityDuplicates() {
    const links = document.querySelectorAll('link[id="googleidentityservice"]');
    for (let i = 1; i < links.length; i++) {
      links[i].remove();
    }

    const metas = document.querySelectorAll('meta[http-equiv="origin-trial"]');
    for (let i = 1; i < metas.length; i++) {
      metas[i].remove();
    }
  }

  private renderTOTPDialog() {
    this.authDialogContent.innerHTML = '';
    const container = createElement('div', {
      className: `max-w-[550px] text-white bg-background border border-white rounded-3xl p-16`,
    });

    container.appendChild(
      createElement('i', {
        className: `w-14 h-14 mx-auto rounded-full p-2 border border-white mb-8`,
        icon: 'lock',
      }),
    );

    loadIcons();

    container.appendChild(
      createElement('h1', {
        className: 'text-3xl font-bold mb-4',
        textContent: 'Two-Factor Authentication',
      }),
    );

    container.appendChild(
      createElement('p', {
        className: `w-100 font-light text-white/80 leading-tight mb-10 text-center`,
        textContent: `Two-factor authentication is enabled for your account. Please enter the code from your authentication app.`,
      }),
    );

    const errorMessage = createElement('p', {
      className: 'font-light text-red-500 text-sm mt-2',
    });

    const {form, getValue} = createOTPInput();
    form.className = 'flex flex-col justify-center items-center';

    const buttons = createElement('div', {
      className: 'mt-8 w-full flex justify-center items-stretch gap-8',
    });

    buttons.appendChild(
      createElement('button', {
        className: `w-3/5 border border-white/20 rounded text-sm px-4 py-2 cursor-pointer`,
        textContent: 'Return to login',
        attributes: {
          type: 'button',
        },
        onclick: evt => {
          evt.preventDefault();
          this.renderRegistrationForm('login');
        },
      }),
    );
    buttons.appendChild(
      createElement('button', {
        className: `w-3/5 py-2 border border-pink-300 rounded hover:bg-pink-300/10 duration-200 cursor-pointer text-sm`,
        textContent: 'Confirm',
        attributes: {
          type: 'submit',
        },
      }),
    );
    form.appendChild(errorMessage);
    form.appendChild(buttons);

    form.onsubmit = evt => {
      evt.preventDefault();
      const value = getValue();
      verifyTOTP(value, this.totpAccessToken, errorMessage);
    };

    container.appendChild(form);
    this.authDialogContent.appendChild(container);
  }

  private renderRegistrationForm(mode: 'login' | 'signup'): void {
    // Empty authentication dialog content before renderering new registration form
    this.authDialogContent.innerHTML = '';
    const container = createElement('div', {
      className: `max-w-[550px] text-white bg-background border border-white rounded-3xl p-16`,
    });
    const signin = mode === 'login';

    // Header
    const dialogHeader = createElement('div', {
      className: 'flex items-center gap-2',
    });
    dialogHeader.appendChild(
      createElement('i', {
        className: 'w-8 h-8 text-white hover:text-pink-200 hover:animate-spin',
        icon: 'helloKitty',
      }),
    );
    dialogHeader.appendChild(
      createElement('h1', {
        textContent: signin ? 'Welcome back!' : 'Create your account',
        className: 'font-black text-3xl text-white',
      }),
    );

    container.appendChild(dialogHeader);
    container.appendChild(
      createElement('p', {
        textContent: signin
          ? 'So wonderful to see you again! Please sign in to continue our pong adventures. 🏓'
          : "What? You really never played kittypong before? Fill in your credentials and let's get you in shape right now! 🏓",
        className: 'text-white/70 tracking-wide mb-8',
      }),
    );

    // Remote authentication buttons
    const remoteAuths = createElement('div', {
      className: 'w-full mb-8',
    });
    // const googleButton = createElement('div');
    //   textContent: `Sign ${signin ? 'in' : 'up'} with`,
    //   className:
    //     'h-14 w-full rounded-2xl border border-white bg-linear-to-br from-background to-background text-white hover:from-pink-200 hover:to-pink-300 hover:text-black hover:border-pink-300 cursor-pointer',
    // });
    // googleButton.appendChild(
    //   createElement('strong', {
    //     textContent: ' Google',
    //   }),
    // );

    const script = createElement('script');
    script.type = 'text/javascript';

    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    container.appendChild(script);

    function decodeJWT(token) {
      const parts = token.split('.');
      if (parts.length !== 3) throw new Error('Invalid JWT');

      const payload64 = parts[1];

      let payloadStr;
      try {
        payloadStr = atob(payload64);
      } catch {
        throw new Error('Invalid base64 in JWT payload');
      }

      let payload;
      try {
        payload = JSON.parse(payloadStr);
      } catch {
        throw new Error('Invalid JSON in JWT payload');
      }

      return payload;
    }

    window.googleSignup = async response => {
      //   console.debug('Response:', response);
      let payload;
      try {
        const {credential} = response;
        payload = decodeJWT(credential);
      } catch (error) {
        Toastify.error('Invalid payload');
        console.error(error);
      }

      let token: string;
      try {
        const verifyResponse = await this.api.post('auth/google/verify', {
          token: response.credential,
        });

        if (!verifyResponse.ok) {
          const errorData = await verifyResponse.json();
          throw new Error(errorData.message);
        }

        const data = await verifyResponse.json();
        token = data.accessToken;
        if (!token) {
          throw new Error('no access token');
        }

        localStorage.setItem('accessToken', token);
        await this.websocket.connect();

        this.router.navigate('/homepage');
        return;
      } catch (error) {
        if (error.message !== 'no access token') {
          Toastify.error(error.message);
          return;
        }
      }

      const suggestedUsername = payload.email
        .split('@')[0]
        .substring(0, 16)
        .replace(/[^a-zA-Z0-9_]/g, '_');

      this.authDialogContent.innerHTML = '';
      const createUsernameContainer = createElement('form', {
        className: `flex flex-col gap-4 w-120 bg-background border rounded-3xl p-10 text-white`,
      });
      createUsernameContainer.onsubmit = async evt => {
        evt.preventDefault();

        errorMessage.textContent = '';
        const formData = new FormData(evt.target as HTMLFormElement);
        try {
          const signupResponse = await this.api.post('auth/google/signup', {
            token: response.credential,
            username: formData.get('username'),
          });

          if (!signupResponse.ok) {
            const errorData = await signupResponse.json();
            throw new Error(errorData.message);
          }

          const data = await signupResponse.json();
          if (!data.accessToken) {
            throw new Error('No access token found in response');
          }

          localStorage.setItem('accessToken', data.accessToken);
          await this.websocket.connect();

          this.router.navigate('/homepage');
          return;
        } catch (error) {
          errorMessage.textContent = error.message;
          console.error(error);
        }
      };

      createUsernameContainer.appendChild(
        createElement('label', {
          className: 'font-bold',
          textContent: 'Choose an username',
        }),
      );
      const usernameInput = createElement('input', {
        className: 'border rounded w-full px-4 py-2',
        attributes: {
          name: 'username',
        },
      });
      usernameInput.value = suggestedUsername;

      createUsernameContainer.appendChild(usernameInput);

      const errorMessage = createElement('p', {
        className: 'text-sm text-red-500 font-light',
      });
      createUsernameContainer.appendChild(errorMessage);

      createUsernameContainer.appendChild(
        createElement('button', {
          textContent: 'Create account',
          className: `border border-pink-300 px-4 py-2 rounded-lg cursor-pointer hover:bg-pink-300/20 bg-background text-pink-300 ml-auto`,
          attributes: {
            type: 'submit',
          },
        }),
      );

      this.authDialogContent.appendChild(createUsernameContainer);
    };

    const existingButton = document.getElementById('g_id_onload');
    if (existingButton) existingButton.remove();

    const googleSignin = createElement('div');
    googleSignin.innerHTML = `
      <div
        id="g_id_onload"
        data-client_id="${__GOOGLE_ID__}"
        data-context="${mode === 'signup' ? 'signup' : 'signin'}"
        data-ux_mode="popup"
        data-callback="googleSignup"
        data-auto_prompt="false"
      ></div>
      <div class="g_id_signin rounded-full text-pink-300 w-2/3 mx-auto bg-background"
        data-type="standard"
        data-shape="pill"
        data-theme="filled_white"
        data-text="${mode === 'signup' ? 'signup_with' : 'signin_with'}"
        data-size="large"
        data-locale="en"
        data-logo_alignment="left">
      </div>
    `;

    remoteAuths.appendChild(googleSignin);
    container.appendChild(remoteAuths);
    this.cleanupGoogleIdentityDuplicates();

    const separator = createElement('div', {
      className: 'relative w-full px-4 text-center mb-8 opacity-50 text-sm',
    });
    separator.appendChild(createElement('hr'));
    separator.appendChild(
      createElement('span', {
        textContent: 'OR',
        className: 'absolute -top-2 bg-background px-4 -ml-6',
      }),
    );

    container.appendChild(separator);

    // Manual authentication form
    const errorMessage = createElement('p', {
      className: 'text-red-500 mt-2 text-sm font-light ml-4',
    });

    const handleSubmitForm = async (evt: Event) => {
      evt.preventDefault();
      errorMessage.textContent = '';

      const body = Object.fromEntries(
        new FormData(evt.target as HTMLFormElement).entries(),
      );
      if (body.username === '' || body.password === '') {
        errorMessage.textContent = 'Blank field';
        return;
      }

      this.store.toggleLoading('authentication');
      const result = await register(mode, body);
      if (result.success && result.totp) {
        this.totpAccessToken = result.totp;
        this.renderTOTPDialog();
      } else if (result.success) {
        this.router.navigate('/homepage');
      } else if (!result.success && result.message) {
        errorMessage.textContent = result.message;
      }

      this.store.toggleLoading('authentication');
    };

    const form = createElement('form', {
      className: 'flex flex-col gap-2 w-full',
      events: {
        submit: handleSubmitForm,
      },
    }) as HTMLFormElement;
    form.appendChild(
      createElement('input', {
        className:
          'border w-full flex justify-center border-white fill-red-500 focus:outline-none pl-12 py-3 px-5 rounded-lg',
        attributes: {
          placeholder: 'Username',
          'input-icon': 'user',
          name: 'username',
        },
      }),
    );
    form.appendChild(
      createElement('input', {
        className:
          'border w-full flex justify-center border-white focus:outline-none pl-12 py-3 px-5 rounded-lg',
        attributes: {
          type: 'password',
          placeholder: 'Password',
          'input-icon': 'key',
          name: 'password',
        },
      }),
    );

    if (mode === 'signup') {
      form.appendChild(
        createElement('input', {
          className:
            'border w-full flex justify-center border-white focus:outline-none pl-12 py-3 px-5 rounded-lg',
          attributes: {
            type: 'password',
            placeholder: 'Confirm password',
            'input-icon': 'key',
            name: 'confirmPassword',
          },
        }),
      );

      const gdprConfirmation = createElement('p', {
        className: 'text-sm max-w-2/3 mx-auto text-white/50 text-center',
        textContent: `By creating an account, you confirm that you have read Kitty Pong's `,
      });
      gdprConfirmation.appendChild(
        createElement('span', {
          className: 'font-bold cursor-pointer underline',
          textContent: 'privacy policy',
          onclick: () => {
            if (this.gdprDialogOpened) return;
            this.gdprDialogOpened = true;

            const gdprContainer = createElement('div', {
              className:
                'text-white bg-background border border-white rounded-3xl max-h-[700px] overflow-hidden p-10 w-100 flex flex-col',
            });
            const gdprHeader = createElement('div', {
              className: 'flex mb-6 items-center justify-between',
            });
            gdprHeader.appendChild(
              createElement('h1', {
                textContent: 'Privacy Policy',
                className: 'font-bold text-2xl flex-none',
              }),
            );
            const closeButton = createElement('button', {
              className:
                'rounded-lg text-white/20 border border-white/20 hover:text-white hover:border-white cursor-pointer p-1',
              onclick: () => {
                this.authDialogContent.removeChild(gdprContainer);
                this.gdprDialogOpened = false;
              },
            });
            closeButton.appendChild(
              createElement('i', {
                className: 'w-4 h-4',
                attributes: {
                  icon: 'x',
                },
              }),
            );
            gdprHeader.appendChild(closeButton);
            gdprContainer.appendChild(gdprHeader);

            gdprContainer.appendChild(
              createElement('p', {
                className: 'flex-1 overflow-auto',
                textContent: gdpr,
              }),
            );

            this.authDialogContent.appendChild(gdprContainer);
            loadIcons();
          },
        }),
      );
      form.appendChild(gdprConfirmation);
    }

    form.appendChild(errorMessage);

    const submitButton = createElement('button', {
      className: `w-full enabled:cursor-pointer h-16 rounded-full font-bold uppercase bg-linear-to-br from-pink-200 to-pink-300 text-black mt-6 enabled:shadow-lg shadow-pink-300/20 hover:shadow-pink-300/30 hover:-translate-y-1 transition-all disabled:from-white/10 disabled:to-white/10 disabled:border border-white/20 disbaled:shadow-none disabled:text-white/50 disabled:translate-y-0`,
      textContent: signin ? 'Start playing' : 'Create account',
      attributes: {type: 'submit'},
    });

    const disableSubmitButton = () => {
      const {loading} = this.store.getState();
      const isLoading = loading.includes('authentication');
      submitButton.disabled = isLoading;
      submitButton.textContent = isLoading
        ? 'Checking ...'
        : signin
          ? 'Start playing'
          : 'Create account';
    };

    form.appendChild(submitButton);
    this.subscribeToPath('loading', disableSubmitButton);

    container.appendChild(form);

    // Other registration mode link
    const registrationLink = createElement('p', {
      className: 'w-full text-center font-light text-sm mt-3',
      textContent: signin
        ? "Don't have a pong account yet?"
        : 'Already have a pong account?',
    });
    registrationLink.appendChild(
      createElement('span', {
        className:
          'text-pink-300 font-bold ml-1 cursor-pointer hover:underline',
        textContent: signin ? 'Sign up' : 'Log in',
        onclick: () => this.renderRegistrationForm(signin ? 'signup' : 'login'),
      }),
    );

    container.appendChild(registrationLink);
    this.authDialogContent.appendChild(container);
    loadIcons();
  }

  private renderWelcomeContainer(showAuthDialog: () => void) {
    const container = createElement('div', {
      className:
        'relative flex-none w-full xl:w-1/2 max-w-[700px] h-full flex flex-col justify-center',
    });

    // Header
    const header = createElement('div', {
      className: 'relative',
    });
    header.appendChild(
      createElement('p', {
        textContent: 'Play with your friends and become the best player of 42',
        className: 'text-pink-300 uppercase tracking-wide mb-[200px] z-10',
      }),
    );
    header.appendChild(
      createElement('img', {
        className: 'absolute h-[300px] -left-16 -top-10 z-0',
        attributes: {
          src: img,
        },
      }),
    );

    container.appendChild(header);

    // Welcome text
    const text = createElement('p', {
      className: 'text-white tracking-wider font-light leading-relaxed z-10',
    });

    text.appendChild(
      createElement('span', {
        textContent: "Hello there, dear friend! 🎀 I'm ",
      }),
    );
    text.appendChild(
      createElement('span', {
        textContent: 'Kitty White',
        className: 'text-pink-300 font-bold',
      }),
    );
    text.appendChild(
      createElement('span', {
        textContent:
          ", and I've prepared a special Pong adventure just for you and your friends - play together locally or online, compete in magical tournaments, and chat about all our fun matches!",
      }),
    );

    container.appendChild(text);

    // Log in + Sign up buttons
    const buttons = createElement('div', {
      className: 'mt-16 h-14 flex items-center gap-10',
    });

    buttons.appendChild(
      createElement('button', {
        textContent: 'Log in',
        className:
          'rounded-full cursor-pointer w-50 uppercase font-bold h-full bg-linear-to-br from-pink-200 to-pink-300 text-black shadow-lg shadow-pink-300/20 hover:brightness-95 hover:shadow-pink-300/40 hover:-translate-y-1 transition-all',
        onclick: async () => {
          try {
            // Check if the user have a valid access token and therefore doesn't need to put his credentials
            const response = await this.api.get('account');

            if (!response.ok) {
              throw response;
            }

            const data = await response.json();
            this.store.setState({user: data});

            this.router.navigate('/homepage');
          } catch {
            this.renderRegistrationForm('login');
            showAuthDialog();
          }
        },
      }),
    );
    buttons.appendChild(
      createElement('button', {
        textContent: 'Sign up',
        className:
          'rounded-full cursor-pointer w-50 uppercase font-bold h-full bg-gray-500/20 text-pink-300 shadow-lg hover:brightness-95 hover:-translate-y-1 transition-all',
        onclick: () => {
          this.renderRegistrationForm('signup');
          showAuthDialog();
        },
      }),
    );

    container.appendChild(buttons);

    return container;
  }

  private renderKPIBlock = (
    icon: string,
    title: string,
    value: string,
    darkMode: boolean,
  ) => {
    const kpi = createElement('div', {
      className: `w-[260px] h-[210px] ${darkMode ? 'bg-linear-to-br from-gray-500/20 to-gray-800/20 text-white' : 'text-black bg-linear-to-br from-pink-200 to-pink-300 shadow-lg shadow-pink-300/30'} rounded-3xl p-6 flex flex-col items-start justify-between hover:scale-105 transition-all`,
    });

    kpi.appendChild(
      createElement('i', {
        className: `${darkMode ? 'bg-pink-300 text-black' : 'bg-background text-pink-300'} p-3 w-12 h-12 rounded-xl`,
        attributes: {icon: icon},
      }),
    );

    const valueContainer = createElement('div', {
      className: 'flex flex-col items-end w-full',
    });
    valueContainer.appendChild(
      createElement('p', {
        className: 'uppercase opacity-70',
        textContent: title,
      }),
    );
    valueContainer.appendChild(
      createElement('p', {
        className: `text-[40px] -mt-2 font-bold ${darkMode ? 'text-pink-300' : 'text-black'}`,
        textContent: value,
      }),
    );

    kpi.appendChild(valueContainer);

    return kpi;
  };

  private renderKPIContainer(container: HTMLDivElement) {
    const {publicKPIs} = this.store.getState();

    container.appendChild(
      this.renderKPIBlock(
        'users',
        'Total users',
        publicKPIs.totalUsers.toString(),
        true,
      ),
    );
    container.appendChild(
      this.renderKPIBlock(
        'pingpong',
        'Total games',
        publicKPIs.totalGames.toString(),
        false,
      ),
    );
    container.appendChild(
      this.renderKPIBlock('star', 'Best player', publicKPIs.bestPlayer, false),
    );

    const stickerBlock = createElement('div', {
      className: `group w-[260px] h-[210px] p-2 flex flex-col hover:scale-105 transition-all`,
    });
    stickerBlock.appendChild(
      createElement('img', {
        className: 'mx-auto h-full animate-wiggle',
        attributes: {
          src: sticker,
        },
      }),
    );

    container.appendChild(stickerBlock);
  }

  render(): HTMLElement {
    if (location.pathname === '/') {
      this.store.clearState();
    }

    fetchPublicKPIs();

    const container = createElement('div', {
      className:
        'w-screen h-screen overflow-hidden flex justify-around max-w-[1600px] items-center gap-20',
    });

    const {dialogContent, showModal} = createDialog('auth');
    dialogContent.className = 'flex overflow-hidden items-center gap-4';
    this.authDialogContent = dialogContent;

    const kpiContainer = createElement('div', {
      className: `flex-none w-1/2 max-w-[600px] hidden xl:flex xl:flex-wrap justify-end gap-10 overflow-y-visible`,
    });
    this.store.subscribeToPath('publicKPIs', () =>
      this.renderKPIContainer(kpiContainer),
    );
    container.appendChild(kpiContainer);
    container.appendChild(this.renderWelcomeContainer(showModal));
    return container;
  }
}
