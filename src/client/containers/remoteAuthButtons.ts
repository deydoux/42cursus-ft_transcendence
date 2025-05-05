import {html} from '../utils/html';

export const renderRemoteAuthButtons = () => {
  return html` <div class="w-full space-y-1">
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
    <button class="btn rounded-b-2xl">Sign up with <strong>42</strong></button>
  </div>`;
};
