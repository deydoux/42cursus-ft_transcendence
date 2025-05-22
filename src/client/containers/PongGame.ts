import {html} from '../utils/html';

export const renderPong = () =>
  html`<div>
    <div class="relative flex items-center justify-center">
      <h1 id="leftPlayer" class="player">Player 1</h1>
      <h1 id="leftPlayerScore" class="score">0</h1>
      <i icon="field" class="m-5 text-white"></i>
      <h1 id="rightPlayerScore" class="score">0</h1>
      <h1 id="rightPlayer" class="player">Player 2</h1>
    </div>
    <div class="relative flex w-full flex-col items-center">
      <h1 id="announcement" class="announcement relative justify-center"></h1>
      <canvas id="pong" class="pong rounded-[30px] border"></canvas>
    </div>
  </div>`;
