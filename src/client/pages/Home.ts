import {html} from '../utils/html';

export function renderHome(
  fgContainer: HTMLElement,
  bgContainer: HTMLElement,
): void {
  bgContainer.className = 'flex-1 h-full rounded-[30px] border border-white';
  fgContainer.className =
    'w-[500px] ml-10 h-full flex items-center justify-center text-white left-40 border p-10 py-15 rounded-[30px] backdrop-blur-lg';

  bgContainer.appendChild(
    html`<div
      class="flex h-screen w-full items-center justify-center text-[3em] font-bold text-white"
    >
      Welcome to the homepage
    </div>`,
  );
}
