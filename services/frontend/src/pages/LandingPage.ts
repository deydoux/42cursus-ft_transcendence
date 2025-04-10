import {createSignInForm} from '../components/SignInForm';

export const LandingPage = (): HTMLElement => {
  const container = document.createElement('div');
  container.appendChild(createSignInForm());
  return container;
};
