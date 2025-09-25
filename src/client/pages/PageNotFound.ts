import {BaseComponent} from '../components/BaseComponent';
import {Router} from '../services/router';
import {createElement} from '../utils/dom';

export class PageNotFound extends BaseComponent {
  private router = Router.getInstance();

  render(): HTMLElement {
    const container = createElement('div', {
      className: 'flex flex-col items-center',
    });

    const header = createElement('h1', {
      textContent: '404 - Page not found',
      className: 'text-3xl font-semibold',
    });
    const link = createElement('a', {
      textContent: 'Return to homepage',
      className: 'mt-2 hover:underline',
      attributes: {
        href: '/',
      },
      events: {
        click: e => {
          e.preventDefault();
          this.router.navigate('/homepage');
        },
      },
    });

    container.appendChild(header);
    container.appendChild(link);
    return container;
  }
}
