import {html} from '../utils/html';

export const renderSignupForm = (): HTMLElement => {
  return html`<div>
    <h1 class="card-title">
      Want to pong with us?
    </h1>
    <div class="mt-7 max-w-80 mx-auto flex flex-col items-center gap-1">
      <p class="text-white/80 mb-2">
        Wait... you really don't have an account yet?
      </p>
      <button class="btn rounded-t-2xl">
        Sign up with <strong>Google</strong>
      </button>
      <button class="btn rounded-b-2xl">
        Sign up with <strong>42</strong>
      </button>

      <div class="flex w-full items-center gap-2 px-4 my-4">
        <div class="border-b border-white/50 flex-1"></div>
        <span>or</span>
        <div class="border-b border-white/50 flex-1"></div>
      </div>
      <div class="w-full">
        <input
          class="mb-2 outline-none icon-user border w-full rounded-lg px-4 py-2"
          placeholder="Username"
        />
        <input
          class="outline-none icon-password border w-full rounded-lg px-4 py-2"
          placeholder="Password"
          type="password"
        />
        <button
          class="w-full cursor-pointer group flex items-center justify-center uppercase font-bold bg-white text-lg text-black mt-4 py-2 rounded-full"
        >
          <span>Create an account</span>
          <img
            src="https://cdn-icons-png.flaticon.com/512/2500/2500356.png"
            class="visible-icon-on-hover"
          />
        </button>
        <p class="w-full text-center mt-4 text-sm text-white/80">
          Don't have a pong account yet?
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
};
