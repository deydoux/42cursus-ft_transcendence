import {renderHome} from '../pages/Home';
import {renderLandingPage} from '../pages/LandingPage';

window.onpopstate = router;

export function router(): void {
  console.log();
  const fgContainer = document.getElementById('fg-container');
  const bgContainer = document.getElementById('bg-container');
  const path = window.location.pathname;

  if (!(bgContainer && fgContainer)) return;
  bgContainer.innerHTML = '';
  fgContainer.innerHTML = '';

  switch (path) {
    case '/':
    case '/signup':
    case '/signin':
      renderLandingPage(fgContainer, bgContainer, path);
      break;
    case '/homepage':
    default:
      renderHome(fgContainer, bgContainer);
      break;
  }
}
