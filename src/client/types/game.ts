import {Ball} from '../containers/pong/ball';
import {Car} from '../containers/race/car';
import {Keys} from '../utils/keys';
import {Paddle} from '../containers/pong/paddle';
import {Timer} from '../containers/timer';

export interface IPongGame {
  player: IPlayer;
  opponent: IPlayer;
  ball: Ball;
  ctx: CanvasRenderingContext2D;
  keys: Keys;
  gameStarted: boolean;
  isScoring: boolean;
  timer: Timer;
  isLocal: boolean;
}

export interface IPlayer {
  id: number;
  username: string;
  avatar: string;
  score: number;
  paddle: Paddle | null;
  car: Car | null;
  scoreElement: HTMLElement;
  side: string;
  /* wins: number;
    winstreak: number;
    max_winstreak: number;
    losses: number; */
}
