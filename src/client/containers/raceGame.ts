import {html} from '../utils/html';

export const renderCar = () =>
  html`<div>
    <div class="race-box">
      <h1 id="announcement" class="announcement">
        Welcome to Hello Kitty Race!
      </h1>
      <canvas id="race" class="race rounded-[30px]"></canvas>
    </div>
    <button id="race-btn" class="w-90%">Start Game</button>
  </div>`;
