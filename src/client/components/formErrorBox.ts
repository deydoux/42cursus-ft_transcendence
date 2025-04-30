import {html} from '../utils/html';

export const renderFormErrorBox = (errorLabelExtra?: HTMLElement) => {
  const box = html`<div
    id="form-error-box"
    class="border-error text-error flex max-h-0 items-stretch justify-between overflow-hidden rounded-lg border text-sm opacity-0 transition-all"
  >
    <div class="hide-scrollbar overflow-y-auto px-6 py-3">
      <span id="error-label"></span><br />
    </div>
    <button
      class="hover:bg-error/20 flex w-16 flex-none items-center justify-center"
      id="close-error-box"
      type="btn"
    >
      ⨯
    </button>
  </div>`;

  if (errorLabelExtra) {
    box
      .querySelector('span#error-label')
      ?.parentElement?.appendChild(errorLabelExtra);
  }

  return box;
};

/*

*/
