import {router} from './router';
import './styles/main.css';

window.addEventListener('hashchange', router);
window.addEventListener('load', router);
