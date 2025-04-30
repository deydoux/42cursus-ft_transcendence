import {html} from '../utils/html';

export const renderSigninForm = (): HTMLElement => {
  return html`<div>
    <div class="relative flex items-center text-[3em]">
      <h1 class="special-gothic-expanded z-10 leading-12">Welcome back!</h1>
      <button
        id="emoji"
        class="absolute z-0 ml-12 cursor-default text-[2.2em] transition-transform duration-200 select-none"
      >
        🏓
      </button>
    </div>
    <p class="-mt-2 ml-60 text-lg">Still want to play ?</p>
    <div class="mx-auto mt-20 flex max-w-80 flex-col items-center gap-1">
      <p class="text-primary/80 mb-2">Sign in to play some pong with us</p>
      <button
        class="btn group flex items-center justify-center gap-1 rounded-t-2xl"
      >
        Log in with
        <strong class="flex">
          <span class="group-hover:text-[#4285F4]">G</span>
          <span class="group-hover:text-[#EA4335]">o</span>
          <span class="group-hover:text-[#FBBC04]">o</span>
          <span class="group-hover:text-[#4285F4]">g</span>
          <span class="group-hover:text-[#34A853]">l</span>
          <span class="group-hover:text-[#EA4335]">e</span>
        </strong>
      </button>
      <button class="btn rounded-b-2xl">Log in with <strong>42</strong></button>

      <div class="my-4 flex w-full items-center gap-2 px-4">
        <div class="border-primary/50 flex-1 border-b"></div>
        <span>or</span>
        <div class="border-primary/50 flex-1 border-b"></div>
      </div>

      <form id="signin-form" class="w-full">
        <input
          class="mb-2 w-full rounded-lg border px-4 py-2 pl-10 transition-all outline-none"
          placeholder="Username"
          id="username"
          type="text"
          input-icon="user"
        />
        <input
          class="w-full rounded-lg border px-4 py-2 transition-all outline-none"
          placeholder="Password"
          type="password"
          id="password"
          autocomplete="on"
          input-icon="key"
        />
        <button
          type="submit"
          class="group bg-primary text-background mt-4 flex w-full cursor-pointer items-center justify-center rounded-full py-2 text-lg font-bold uppercase transition-transform active:scale-105"
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
};
