import {html} from '../utils/html';
import profilePic from '../assets/pp.jpeg';

export const renderPong = () =>
  html`<div class="w-full">
    <div class="relative flex w-full flex-col items-center">
      <div
        class="box w-[calc(100%-100px)] rounded-t-[20px] border-6 border-b-0 border-pink-300 bg-linear-to-br from-pink-200 to-pink-300 bg-clip-text px-8 pt-1 pb-0"
      >
        <img id="p1_pic" src="${profilePic}" class="mt-1 h-10 w-10" />
        <h1 id="p1_name"></h1>
        <h1 id="p1_score"></h1>
        🎀
        <h1 id="p2_score"></h1>
        <h1 id="p2_name"></h1>
        <img id="p2_pic" src="${profilePic}" class="mt-1 h-10 w-10" />
      </div>
      <canvas
        id="pong"
        class="pong -mt-1 bg-linear-to-br from-pink-200 to-pink-300 shadow-lg shadow-pink-300/30"
      ></canvas>
    </div>
    <button
      id="pong-btn"
      class="w-90% bg-linear-to-br from-[#1F2326] to-[#121619]"
    >
      Start Game
    </button>
  </div>`;
