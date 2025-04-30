import {html} from '../utils/html';

export const renderFormErrorBox = () => {
  return html`<div
    id="form-error-box"
    class="border-error text-error flex max-h-0 items-stretch justify-between overflow-hidden rounded-lg border text-sm opacity-0 transition-all"
  >
    <div class="hide-scrollbar overflow-y-auto px-6 py-3">
      <span id="error-label"></span><br />
      <div>
        <span>Have you already</span>
        <a
          class="text-md cursor-pointer font-bold hover:underline"
          href="signup"
        >
          signed up
        </a>
        <span>?</span>
      </div>
    </div>
    <button
      class="hover:bg-error/20 flex w-16 flex-none items-center justify-center"
      id="close-error-box"
      type="btn"
    >
      ⨯
    </button>
  </div>`;
};
