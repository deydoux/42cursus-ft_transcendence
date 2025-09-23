import {Ball} from '../containers/ball';
import {Car} from '../containers/car';
import {Keys} from '../utils/keys';
import {Paddle} from '../containers/paddle';
import {Timer} from '../containers/timer';

export interface PongGame {
  player: Player;
  opponent: Player;
  ball: Ball;
  ctx: CanvasRenderingContext2D;
  playerScoreElement: HTMLElement;
  opponentScoreElement: HTMLElement;
  keys: Keys;
  gameStarted: boolean;
  isScoring: boolean;
  timer: Timer;
}

export interface Player {
  id: number;
  username: string;
  avatar: string;
  score: number;
  paddle: Paddle | null;
  car: Car | null;
  /* wins: number;
    winstreak: number;
    max_winstreak: number;
    losses: number; */
}
