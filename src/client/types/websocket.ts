export interface WebSocketConfig {
  url: string;
  protocols?: string | string[];
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  debug?: boolean;
}

export interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp?: number;
}

export type WebSocketEventHandler = (data?: any) => void;
export type WebSocketErrorHandler = (error: Event | Error) => void;

export enum WebSocketState {
  CONNECTING = 0,
  OPEN = 1,
  CLOSING = 2,
  CLOSED = 3
}
