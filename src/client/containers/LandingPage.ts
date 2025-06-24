import { BaseComponent } from "../components/BaseComponent";
import { Router } from "../services/router";
import { DOMUtils } from "../utils/dom";

export class LandingPage extends BaseComponent {
  constructor(private router: Router) {
    super();
  }

  render(): HTMLElement {
    console.log('Rendering Landing page');

    const container = DOMUtils.createElement('a', {
      className: 'text-white',
      textContent: "Hello world!",
      attributes: {
        href: '/homepage'
      },
      events: {
        click: (e) => {
          e.preventDefault();
          this.router.navigate('/homepage');
        }
      }
    });
    return container;
  }
}