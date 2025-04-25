import HotReload from './HotReload';
import {router} from './router';

new HotReload();

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
