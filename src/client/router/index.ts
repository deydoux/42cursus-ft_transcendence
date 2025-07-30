import {renderHome} from '../pages/Home';
import {renderLandingPage} from '../pages/LandingPage';
import {renderPongPage} from '../pages/PongPage';
import {renderRacePage} from '../pages/RacePage';
window.onpopstate = router;

export function router(): void {
  const path = window.location.pathname;

  switch (path) {
    case '/':
    case '/signup':
    case '/signin':
      renderLandingPage(path);
      break;
    case '/pong':
      renderPongPage();
      break;
    case '/race':
      renderRacePage();
      break;
    case '/homepage':
    default:
      renderHome();
      break;
  }
}
