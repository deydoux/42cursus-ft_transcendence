import {html} from '../utils/html';
import {renderAuthenticationInputs} from './authenticationInputs';
import {renderRemoteAuthButtons} from './remoteAuthButtons';
import {renderVerticalSeparator} from '../components/verticalSeparator';

export const renderSignupForm = () =>
  html`<div>
    <h1 class="title">Want to pong with us?</h1>
    <div class="mt-17 max-w-80 mx-auto flex flex-col items-center gap-1">
      <p class="text-white/60 mb-2">Wait... you really don't have an account yet?</p>
      ${renderRemoteAuthButtons()}
      ${renderVerticalSeparator('or')}
      <form id="signup-form" class="w-full">
      ${renderAuthenticationInputs()}
        <button
          type="submit"
          class="group mt-4 btn filled strong flex items-center justify-center rounded-full"
        >
          <span>Create an account</span>
          <i icon="pingpong" class="visible-icon-on-hover"></i>
        </button>
        <p class="w-full text-center mt-4 text-sm text-white/80">
          Already have a pong account ?
          <a
            class="text-white font-bold text-md hover:underline cursor-pointer"
            href="signin"
          >
            Log In
          </button>
        </p>
      </div>
    </div>
  </div>`;
