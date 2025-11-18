import {Popup, createPopupContainer} from '../components/Popup';
import {BaseComponent} from '../components/BaseComponent';
import {Store} from '../services/store';
import {Toastify} from '../utils/toastify';
import {createElement} from '../utils/dom';
import pongsticker from '../assets/home/pong.png';
import racesticker from '../assets/home/race.png';
import settingssticker from '../assets/home/settings.png';
import statisticssticker from '../assets/home/stats.png';
import sticker from '../assets/sticker.png';
import textIMG from '../assets/kittypong.png';
import tournamentsticker from '../assets/home/tournament.png';

export class Homepage extends BaseComponent {
  private gameModeMenu: Popup | null = null;

  constructor(private chat: HTMLElement) {
    super();
  }

  private renderGameModeMenu = (evt: PointerEvent, game: 'pong' | 'race') => {
    const buttons = createElement('div', {
      className: 'flex flex-col items-stretch gap-2',
    });
    ['play local', 'play remote', 'play ranked'].forEach(mode => {
      buttons.appendChild(
        createElement('button', {
          className: `w-full font-semibold rounded text-white hover:bg-pink-300 hover:text-background duration-100 p-4 uppercase cursor-pointer`,
          textContent: mode,
          onclick: () => {
            this.store.setState({
              game: {
                ...this.store.getState().game,
                isLocal: mode === 'play local',
              },
            });

            if (mode === 'play local') {
              if (Store.getInstance().getState().joinedTournament) {
                Toastify.error('You are already in a tournament');
              } else {
                sessionStorage.setItem('validGameAccess', 'true');
                this.router.navigate(`/${game}`);
              }
            } else if (mode === 'play remote') {
              this.websocket.send({
                type: 'joinMatchmaking',
                game: game,
                mode: 'casual',
              });
            } else {
              this.websocket.send({
                type: 'joinMatchmaking',
                game: game,
                mode: 'ranked',
              });
            }

            if (this.gameModeMenu) this.gameModeMenu.destroy();
          },
        }),
      );
    });

    this.gameModeMenu = createPopupContainer({
      x: evt.pageX,
      y: evt.pageY,
      className: `absolute min-w-40 bg-background/40 backdrop-blur-md rounded-lg shadow-xl border p-1 border-white/30 text-sm z-50`,
      content: buttons,
      onClose: () => {
        this.gameModeMenu = null;
      },
    });

    this.gameModeMenu.show();
  };

  renderBanner = () => {
    const container = createElement('div', {
      className: `relative bg-gradient-to-br from-background to-pink-300/10 border border-pink-300/70 w-full h-50 rounded-xl`,
    });
    container.appendChild(
      createElement('p', {
        className: 'text-xs m-3 text-pink-300/30',
        textContent: 'made with ❤︎ by deydoux, mapale & quteriss',
      }),
    );
    container.appendChild(
      createElement('img', {
        className: 'absolute -rotate-5 h-[140%] -left-15 -top-10',
        attributes: {src: textIMG},
      }),
    );
    container.appendChild(
      createElement('img', {
        className:
          'absolute rotate-5 -right-5 -bottom-5 animate-wiggle w-30 lg:40 xl:w-60 2xl:w-65',
        attributes: {src: sticker},
      }),
    );
    return container;
  };

  render(): HTMLElement {
    const container = createElement('div', {
      className: 'flex h-full w-full gap-10',
    });

    const homepage = createElement('div', {
      className: 'flex-1 flex flex-col',
    });

    homepage.appendChild(this.renderBanner());

    const buttons = createElement('div', {
      className: 'flex flex-col flex-1',
    });
    const renderButton = (
      name: string,
      onclick?: (evt: PointerEvent) => void,
      sticker?: string,
    ) => {
      const button = createElement('button', {
        className: `group relative flex items-center justify-center overflow-hidden uppercase cursor-pointer font-bold flex-1 h-full bg-gradient-to-br from-background to-white/5 hover:to-pink-300/20 hover:border-pink-300 border border-white/50 rounded-lg duration-200`,
      });

      if (sticker) {
        button.appendChild(
          createElement('img', {
            className: `absolute z-0 max-h-[120%] h-auto w-auto object-contain grayscale opacity-10 group-hover:grayscale-0 group-hover:scale-115 duration-200 group-hover:opacity-100 group-hover:rotate-3`,
            attributes: {src: sticker},
            onclick: onclick as EventListener,
          }),
        );
      }

      button.appendChild(
        createElement('p', {
          textContent: name,
          className: 'z-10 drop-shadow-[0_0_5px_rgb(0,0,0)]',
          onclick: onclick as EventListener,
        }),
      );

      return button;
    };

    const firstRow = createElement('div', {
      className: 'flex h-5/9 items-center gap-4 mt-4',
    });
    firstRow.appendChild(
      renderButton(
        'Play Pong',
        evt => this.renderGameModeMenu(evt, 'pong'),
        pongsticker,
      ),
    );
    firstRow.appendChild(
      renderButton(
        'Play race',
        evt => this.renderGameModeMenu(evt, 'race'),
        racesticker,
      ),
    );
    buttons.appendChild(firstRow);

    const secondRow = createElement('div', {
      className: 'flex flex-1 items-center gap-4 mt-4 text-sm',
    });
    secondRow.appendChild(
      renderButton(
        'Tournaments',
        () => this.router.navigate('tournament'),
        tournamentsticker,
      ),
    );
    secondRow.appendChild(
      renderButton(
        'Statistics',
        () => this.router.navigate('statistics'),
        statisticssticker,
      ),
    );
    secondRow.appendChild(
      renderButton(
        'Settings',
        () => this.router.navigate('settings'),
        settingssticker,
      ),
    );
    buttons.appendChild(secondRow);

    homepage.appendChild(buttons);

    container.appendChild(homepage);
    if (this.chat) container.appendChild(this.chat);
    return container;
  }
}
