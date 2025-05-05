import {renderHome} from '../pages/Home';
import {renderLandingPage} from '../pages/LandingPage';

window.onpopstate = router;

export function router(): void {
  const path = window.location.pathname;

  switch (path) {
    case '/':
    case '/signup':
    case '/signin':
      renderLandingPage(path);
      break;
    case '/homepage':
    default:
      renderHome();
      break;
  }
}
