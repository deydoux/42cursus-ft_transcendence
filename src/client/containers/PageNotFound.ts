import {BaseComponent} from '../components/BaseComponent';
import {DOMUtils} from '../utils/dom';
import {Router} from '../services/router';

export class PageNotFound extends BaseComponent {
  constructor(private router: Router) {
    super();
  }

  render(): HTMLElement {
    const container = DOMUtils.createElement('div', {
      className: 'flex flex-col items-center',
    });

    const header = DOMUtils.createElement('h1', {
      textContent: '404 - Page not found',
      className: 'text-3xl font-semibold',
    });
    const link = DOMUtils.createElement('a', {
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
