import {BaseComponent} from '../components/BaseComponent';
import {Chat} from '../containers/Chat';
import {DOMUtils} from '../utils/dom';

export class Settings extends BaseComponent {
  render(): HTMLElement | undefined {
    const container = DOMUtils.createElement('div', {
      className: 'w-screen h-screen flex items-center gap-10 py-16',
    });
    const settings = DOMUtils.createElement('div', {
      className: 'h-full flex-1 bg-[blue] flex flex-wrap gap-10',
    });

    container.appendChild(settings);
    const chat = new Chat().render();
    if (chat) container.appendChild(chat);
    return container;
  }
}
