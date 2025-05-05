import {html} from '../utils/html';

export const renderVerticalSeparator = (label: string) => {
  return html`<div class="my-4 flex w-full items-center gap-2 px-4">
    <div class="flex-1 border-b border-white/50"></div>
    <span>${label}</span>
    <div class="flex-1 border-b border-white/50"></div>
  </div>`;
};
