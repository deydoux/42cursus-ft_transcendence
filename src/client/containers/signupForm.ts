import {html} from '../utils/html';

export const renderSignupForm = (): HTMLElement => {
  return html`<div>
    <h1 class="special-gothic-expanded z-10 text-[3em] leading-12 text-center w-100">Want to pong with us?</h1>  
    <div class="mt-17 max-w-80 mx-auto flex flex-col items-center gap-1">
      <p class="text-white/80 mb-2">
        Wait... you really don't have an account yet?
      </p>
      <button
        class="btn group flex items-center justify-center gap-1 rounded-t-2xl"
      >
        Sign up with
        <strong class="flex">
          <span class="group-hover:text-[#4285F4]">G</span>
          <span class="group-hover:text-[#EA4335]">o</span>
          <span class="group-hover:text-[#FBBC04]">o</span>
          <span class="group-hover:text-[#4285F4]">g</span>
          <span class="group-hover:text-[#34A853]">l</span>
          <span class="group-hover:text-[#EA4335]">e</span>
        </strong>
      </button>
      <button class="btn rounded-b-2xl">
        Sign up with <strong>42</strong>
      </button>

      <div class="flex w-full items-center gap-2 px-4 my-4">
        <div class="border-b border-white/50 flex-1"></div>
        <span>or</span>
        <div class="border-b border-white/50 flex-1"></div>
      </div>
      <form id="signup-form" class="w-full">
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
          class="group mt-4 flex w-full cursor-pointer items-center justify-center rounded-full bg-white py-2 text-lg font-bold text-black uppercase transition-transform active:scale-105"
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
};
