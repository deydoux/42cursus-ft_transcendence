import {Home} from '../pages/Home';
import {LandingPage} from '../pages/LandingPage';

export function router(): void {
  const root = document.getElementById('root');
  if (!root) return;

  root.innerHTML = '';

  const path = window.location.hash;

  switch (path) {
    case '#/signin':
      root.appendChild(LandingPage());
      break;
    case '#/':
    default:
      root.appendChild(Home());
      break;
  }
}
