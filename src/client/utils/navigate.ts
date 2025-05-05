import {router} from '../router';

export const navigate = (title: string, newURL: string): void => {
  history.pushState({}, title, newURL);
  router();
};
