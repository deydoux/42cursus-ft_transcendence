import {html} from '../utils/html';

export const renderPong = () =>
  html`<div>
    <div class="relative flex w-full flex-col items-center">
      <h1 id="announcement" class="announcement relative justify-center"></h1>
      <canvas id="pong" class="pong rounded-[30px] border"></canvas>
    </div>
    <button id="pong-btn" class="w-90%">Start Game</button>
  </div>`;
