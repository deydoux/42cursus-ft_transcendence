import {html} from '../utils/html';

export function renderHome(): void {
  const right = document.getElementById('right-container');
  const left = document.getElementById('left-container');
  if (!(right && left))
    return console.error('Could not find right and left containers');

  left.className = 'flex-1 h-full rounded-[30px] border';
  right.className =
    'w-[550px] flex-none h-full flex flex-col gap-5 items-center';

  right.appendChild(
    html`<div class="w-full flex-1 rounded-[30px] border"></div>`,
  );
  right.appendChild(
    html`<div class="h-14 w-full flex-none rounded-[30px] border"></div>`,
  );
}
