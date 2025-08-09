import '../styles/main.css';
import {BaseComponent} from '../components/BaseComponent';
import {DOMUtils} from '../utils/dom';
import {api} from '../utils/Api';
import {createDialog} from '../components/Dialog';
import img from '../assets/kittypong.png';
import {loadIcons} from '../utils/icons';
import {socket} from '../utils/websocket';
import sticker from '../assets/sticker.png';

export class LandingPage extends BaseComponent {
  private authDialogContent: HTMLDivElement;

  private async register(
    endpoint: string,
    body: Record<string, FormDataEntryValue>,
    errorMessage: HTMLElement,
  ): Promise<void> {
    try {
      const response = await api.post(`auth/${endpoint}`, body);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const data = await response.json();
      api.setAccessToken(data.accessToken);

      // Initialize websocket connection
      socket.updateConfig({
        protocols: [localStorage.getItem('accessToken') ?? ''],
      });
      await socket.connect();

      this.router.navigate('/homepage');
    } catch (error) {
      errorMessage.textContent = error.message;
    }
  }

  private renderRegistrationForm(mode: 'login' | 'signup'): void {
    // Empty authentication dialog content before renderering new registration form
    this.authDialogContent.innerHTML = '';
    const signin = mode === 'login';

    // Header
    const dialogHeader = DOMUtils.createElement('div', {
      className: 'flex items-center gap-2',
    });
    dialogHeader.appendChild(
      DOMUtils.createElement('i', {
        className: 'w-8 h-8 text-white hover:text-pink-200 hover:animate-spin',
        attributes: {
          icon: 'helloKitty',
        },
      }),
    );
    dialogHeader.appendChild(
      DOMUtils.createElement('h1', {
        textContent: signin ? 'Welcome back!' : 'Create your account',
        className: 'font-black text-3xl text-white',
      }),
    );

    this.authDialogContent.appendChild(dialogHeader);
    this.authDialogContent.appendChild(
      DOMUtils.createElement('p', {
        textContent: signin
          ? 'So wonderful to see you again! Please sign in to continue our pong adventures. 🏓'
          : "What? You really never played kittypong before? Fill in your credentials and let's get you in shape right now! 🏓",
        className: 'text-white/70 tracking-wide mb-8',
      }),
    );

    // Remote authentication buttons
    const remoteAuths = DOMUtils.createElement('div', {
      className: 'w-full mb-8',
    });
    const googleButton = DOMUtils.createElement('button', {
      textContent: `Sign ${signin ? 'in' : 'up'} with`,
      className:
        'h-14 w-full rounded-t-2xl border border-white bg-linear-to-br from-background to-background text-white hover:from-pink-200 hover:to-pink-300 hover:text-black hover:border-pink-300 cursor-pointer',
    });
    googleButton.appendChild(
      DOMUtils.createElement('strong', {
        textContent: ' Google',
      }),
    );
    remoteAuths.appendChild(googleButton);

    const ftButton = DOMUtils.createElement('button', {
      textContent: `Sign ${signin ? 'in' : 'up'} with`,
      className:
        'mt-1 h-14 w-full rounded-b-2xl border border-white bg-linear-to-br from-background to-background text-white hover:from-pink-200 hover:to-pink-300 hover:text-black hover:border-pink-300 cursor-pointer',
    });
    ftButton.appendChild(
      DOMUtils.createElement('strong', {
        textContent: ' 42',
      }),
    );
    remoteAuths.appendChild(ftButton);

    this.authDialogContent.appendChild(remoteAuths);

    const separator = DOMUtils.createElement('div', {
      className: 'relative w-full px-4 text-center mb-8 opacity-50 text-sm',
    });
    separator.appendChild(DOMUtils.createElement('hr'));
    separator.appendChild(
      DOMUtils.createElement('span', {
        textContent: 'OR',
        className: 'absolute -top-2 bg-background px-4 -ml-6',
      }),
    );

    this.authDialogContent.appendChild(separator);

    // Manual authentication form
    const errorMessage = DOMUtils.createElement('p', {
      className: 'text-red-500 mt-2 text-sm font-light ml-4',
    });

    const handleSubmitForm = (evt: Event) => {
      evt.preventDefault();
      errorMessage.textContent = '';

      const body = Object.fromEntries(
        new FormData(evt.target as HTMLFormElement).entries(),
      );
      if (body.username === '' || body.password === '') {
        errorMessage.textContent = 'Blank field';
        return;
      }

      this.register(mode, body, errorMessage);
    };

    const form = DOMUtils.createElement('form', {
      className: 'flex flex-col gap-2',
      events: {
        submit: handleSubmitForm,
      },
    }) as HTMLFormElement;
    form.appendChild(
      DOMUtils.createElement('input', {
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
      DOMUtils.createElement('input', {
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

    form.appendChild(errorMessage);

    form.appendChild(
      DOMUtils.createElement('button', {
        className:
          'w-full h-16 rounded-full font-bold uppercase bg-linear-to-br from-pink-200 to-pink-300 text-black mt-6 shadow-lg shadow-pink-300/20 hover:shadow-pink-300/30 hover:-translate-y-1 transition-all',
        textContent: signin ? 'Start playing' : 'Create account',
        attributes: {
          type: 'submit',
        },
      }),
    );

    this.authDialogContent.appendChild(form);

    // Other registration mode link
    const registrationLink = DOMUtils.createElement('p', {
      className: 'w-full text-center font-light text-sm mt-3',
      textContent: signin
        ? "Don't have a pong account yet?"
        : 'Already have a pong account?',
    });
    registrationLink.appendChild(
      DOMUtils.createElement('span', {
        className:
          'text-pink-300 font-bold ml-1 cursor-pointer hover:underline',
        textContent: signin ? 'Sign up' : 'Log in',
        events: {
          click: () => this.renderRegistrationForm(signin ? 'signup' : 'login'),
        },
      }),
    );

    this.authDialogContent.appendChild(registrationLink);
    loadIcons();
  }

  private renderWelcomeContainer(showAuthDialog: () => void) {
    const container = DOMUtils.createElement('div', {
      className:
        'relative flex-none w-full xl:w-1/2 max-w-[700px] h-full flex flex-col justify-center',
    });

    // Header
    const header = DOMUtils.createElement('div', {
      className: 'relative',
    });
    header.appendChild(
      DOMUtils.createElement('p', {
        textContent: 'Play with your friends and become the best player of 42',
        className: 'text-pink-300 uppercase tracking-wide mb-[200px] z-10',
      }),
    );
    header.appendChild(
      DOMUtils.createElement('img', {
        className: 'absolute h-[300px] -left-16 -top-10 z-0',
        attributes: {
          src: img,
        },
      }),
    );

    container.appendChild(header);

    // Welcome text
    const text = DOMUtils.createElement('p', {
      className: 'text-white tracking-wider font-light leading-relaxed z-10',
    });

    text.appendChild(
      DOMUtils.createElement('span', {
        textContent: "Hello there, dear friend! 🎀 I'm ",
      }),
    );
    text.appendChild(
      DOMUtils.createElement('span', {
        textContent: 'Hello Kitty',
        className: 'text-pink-300 font-bold',
      }),
    );
    text.appendChild(
      DOMUtils.createElement('span', {
        textContent:
          ", and I've prepared a special Pong adventure just for you and your friends - play together locally or online, compete in magical tournaments, and chat about all our fun matches!",
      }),
    );

    container.appendChild(text);

    // Log in + Sign up buttons
    const buttons = DOMUtils.createElement('div', {
      className: 'mt-16 h-14 flex items-center gap-10',
    });

    buttons.appendChild(
      DOMUtils.createElement('button', {
        textContent: 'Log in',
        className:
          'rounded-full w-50 uppercase font-bold h-full bg-linear-to-br from-pink-200 to-pink-300 text-black shadow-lg shadow-pink-300/20 hover:brightness-95 hover:shadow-pink-300/40 hover:-translate-y-1 transition-all',
        events: {
          click: async () => {
            try {
              // Check if the user have a valid access token and therefore doesn't need to put his credentials
              const response = await api.get('account');

              if (!response.ok) {
                throw response;
              }

              this.router.navigate('/homepage');
            } catch (error) {
              this.renderRegistrationForm('login');
              console.error(error);
              showAuthDialog();
            }
          },
        },
      }),
    );
    buttons.appendChild(
      DOMUtils.createElement('button', {
        textContent: 'Sign up',
        className:
          'rounded-full w-50 uppercase font-bold h-full bg-gray-500/20 text-pink-300 shadow-lg hover:brightness-95 hover:-translate-y-1 transition-all',
        events: {
          click: () => {
            this.renderRegistrationForm('signup');
            showAuthDialog();
          },
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
    const kpi = DOMUtils.createElement('div', {
      className: `w-[260px] h-[210px] ${darkMode ? 'bg-linear-to-br from-gray-500/20 to-gray-800/20 text-white' : 'text-black bg-linear-to-br from-pink-200 to-pink-300 shadow-lg shadow-pink-300/30'} rounded-3xl p-6 flex flex-col items-start justify-between hover:scale-105 transition-all`,
    });

    kpi.appendChild(
      DOMUtils.createElement('i', {
        className: `${darkMode ? 'bg-pink-300 text-black' : 'bg-background text-pink-300'} p-3 w-12 h-12 rounded-xl`,
        attributes: {icon: icon},
      }),
    );

    const valueContainer = DOMUtils.createElement('div', {
      className: 'flex flex-col items-end w-full',
    });
    valueContainer.appendChild(
      DOMUtils.createElement('p', {
        className: 'uppercase opacity-70',
        textContent: title,
      }),
    );
    valueContainer.appendChild(
      DOMUtils.createElement('p', {
        className: `text-[40px] -mt-2 font-bold ${darkMode ? 'text-pink-300' : 'text-black'}`,
        textContent: value,
      }),
    );

    kpi.appendChild(valueContainer);

    return kpi;
  };

  private renderKPIContainer() {
    const container = DOMUtils.createElement('div', {
      className:
        'flex-none w-1/2 max-w-[600px] hidden xl:flex xl:flex-wrap justify-end gap-10 overflow-y-visible',
    });

    container.appendChild(
      this.renderKPIBlock('users', 'Total users', '142', true),
    );
    container.appendChild(
      this.renderKPIBlock('pingpong', 'Total games', '380', false),
    );
    container.appendChild(
      this.renderKPIBlock('star', 'Best player', 'mapale', false),
    );

    const stickerBlock = DOMUtils.createElement('div', {
      className: `group w-[260px] h-[210px] p-2 flex flex-col hover:scale-105 transition-all`,
    });
    stickerBlock.appendChild(
      DOMUtils.createElement('img', {
        className: 'mx-auto h-full animate-wiggle',
        attributes: {
          src: sticker,
        },
      }),
    );

    container.appendChild(stickerBlock);

    return container;
  }

  render(): HTMLElement {
    const container = DOMUtils.createElement('div', {
      className:
        'w-screen h-screen overflow-hidden flex justify-around max-w-[1600px] items-center gap-20',
    });

    const {dialogContent, showModal} = createDialog('auth');
    dialogContent.className =
      'max-w-[550px] text-white bg-background border border-white rounded-3xl p-16';
    this.authDialogContent = dialogContent;

    container.appendChild(this.renderKPIContainer());
    container.appendChild(this.renderWelcomeContainer(showModal));
    return container;
  }
}
