import {Ball} from '../containers/pong/ball';
import {Car} from '../containers/race/car';
import {Checkpoint} from '../containers/race/checkpoint';
import {Growpoint} from '../containers/race/growpoint';
import {Keys} from '../utils/keys';
import {Paddle} from '../containers/pong/paddle';
import {Slowpoint} from '../containers/race/slowpoint';
import {Timer} from '../containers/timer';
import {Track} from '../containers/race/track';
import {Wall} from '../containers/race/wall';

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

/*PONG GAME*/
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

export interface PongGameUIElement extends HTMLElement {
  showGameEndModal(data: {
    winner: number;
    result?: string;
    eloChange?: number;
  }): void;
}

/*RACE GAME*/
export interface IRaceGame {
  player: IPlayer;
  opponent: IPlayer;
  track: Track;
  walls: Wall;
  timer: Timer;
  gameStarted: boolean;
  keys: Keys;
  ctx: CanvasRenderingContext2D;
  timerDisplay: HTMLElement;
  checkpoints: Checkpoint[];
  lastCheckpointTime: number | null;
  currentGrowpoint: Growpoint | null;
  lastGrowpointTime: number | null;
  currentSlowpoint: Slowpoint | null;
  lastSlowpointTime: number | null;
}
