import {html} from '../../utils/html';

export const renderCar = () =>
  html`<div class="w-full">
    <div class="race-box">
      <div class="display w-90% mb-4 flex justify-between">
        <h1 id="scores" class="scores top-0 left-0"></h1>
        <h1 id="timer" class="timer top-0 right-0"></h1>
      </div>
      <canvas id="race" class="race rounded-[30px]"></canvas>
    </div>
    <button id="race-btn" class="w-90%">Start Game</button>
  </div>`;
