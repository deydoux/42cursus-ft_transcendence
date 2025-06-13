import {html} from '../utils/html';

export const renderCar = () =>
  html`<div>
    <div class="relative flex w-full flex-col items-center">
      <h1 id="announcement" class="announcement relative justify-center">
        Welcome to Hello Kitty Race!
      </h1>
    </div>
    <div id="racePage" class="relative flex w-full flex-col items-center">
      <canvas id="race" class="race rounded-[30px] border"></canvas>
    </div>
    <div class="mt-25 flex w-full justify-center">
      <button id="race-btn" class="w-400">Start Game</button>
    </div>
  </div>`;
