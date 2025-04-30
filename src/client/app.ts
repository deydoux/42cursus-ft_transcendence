import './hotReload';
import {loadIcons} from './utils/icons';
import {router} from './router';

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
window.onload = () => {
  loadIcons();
};
