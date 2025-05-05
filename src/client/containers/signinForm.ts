import {html} from '../utils/html';
import {renderAuthenticationInputs} from './authenticationInputs';
import {renderRemoteAuthButtons} from './remoteAuthButtons';
import {renderVerticalSeparator} from '../components/verticalSeparator';

export const renderSigninForm = (): HTMLElement => {
  const form = html`<div>
    <div class="relative flex items-center">
      <h1 class="title">Welcome back!</h1>
      <button id="emoji">🏓</button>
    </div>
    <p class="-mt-2 ml-60 text-lg">Still want to play ?</p>
    <div class="mx-auto mt-20 flex max-w-80 flex-col items-center gap-1">
      <p class="text-primary/60 mb-2">Sign in to play some pong with us</p>
      <div id="remote-auth-buttons"></div>
      <div id="vertical-separator"></div>

      <form id="signin-form" class="w-full">
        <div id="authentication-inputs"></div>
        <button
          type="submit"
          class="group btn filled strong mt-4 flex items-center justify-center rounded-full"
        >
          <span>Log In</span>
          <i icon="pingpong" class="visible-icon-on-hover"></i>
        </button>
        <p class="text-primary/80 mt-4 w-full text-center text-sm">
          Don't have a pong account yet?
          <a
            class="text-md text-primary cursor-pointer font-bold hover:underline"
            href="signup"
          >
            Sign Up
          </a>
        </p>
      </form>
    </div>
  </div>`;

  form
    .querySelector('#remote-auth-buttons')
    ?.replaceWith(renderRemoteAuthButtons());
  form
    .querySelector('#vertical-separator')
    ?.replaceWith(renderVerticalSeparator('or'));
  form
    .querySelector('#authentication-inputs')
    ?.replaceWith(renderAuthenticationInputs());

  return form;
};
