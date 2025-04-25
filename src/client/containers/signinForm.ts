import {html} from '../utils/html';

export const renderSigninForm = (): HTMLElement => {
  return html`<div>
    <div class="flex items-center text-[3em]">
      <h1 class="special-gothic-expanded leading-12">Welcome back!</h1>
      <span
        id="emoji"
        class="cursor-default ml-4 transition-transform duration-200 select-none"
      >
        🏓
      </span>
    </div>
    <p class="text-lg ml-60 -mt-4">Still want to play ?</p>
    <div class="mt-10 max-w-80 mx-auto flex flex-col items-center gap-1">
      <p class="text-white/80 mb-2">Sign in to play some pong with us</p>
      <button class="btn rounded-t-2xl">
        Log in with <strong>Google</strong>
      </button>
      <button class="btn rounded-b-2xl">
        Log in with <strong>42</strong>
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
          id="signin-btn"
          class="w-full cursor-pointer group flex items-center justify-center uppercase font-bold bg-white text-lg text-black mt-4 py-2 rounded-full"
        >
          <span>Log In</span>
          <img
            src="https://cdn-icons-png.flaticon.com/512/2500/2500356.png"
            class="visible-icon-on-hover"
          />
        </button>
        <p class="w-full text-center mt-4 text-sm text-white/80">
          Don't have a pong account yet?
          <a
            class="text-white font-bold text-md hover:underline cursor-pointer"
            href="signup"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  </div>`;
};
