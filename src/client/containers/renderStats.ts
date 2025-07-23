import {html} from '../utils/html';

export const renderStats = () =>
  html`<div>
    <div class="relative flex w-full flex-col items-center">
      <h1 class="title relative justify-center">Game's statistics</h1>
      <canvas
        id="pong-bandroll"
        class="pong-bandroll rounded-[30px] border"
      ></canvas>
      <canvas
        id="race-bandroll"
        class="race-bandroll rounded-[30px] border"
      ></canvas>
    </div>
  </div>`;
