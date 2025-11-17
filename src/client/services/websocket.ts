import {Api} from '../utils/Api';
import {Router} from './router';
import {setupChatHandlers} from '../handlers/chat';
import {setupGameHandlers} from '../handlers/game';
import {setupTournamentHandlers} from '../handlers/tournament';

export class Socket {
  private static instance: Socket | null = null;
  private ws: WebSocket | null = null;
  private eventHandlers = new Map<string, ((data) => void)[]>();
  private messageQueue: string[] = [];
  private url = '/api/tunnel';

  static getInstance(): Socket {
    if (!Socket.instance) Socket.instance = new Socket();
    return Socket.instance;
  }

  private handleMessage(event: MessageEvent): void {
    try {
      let message;
      try {
        message = JSON.parse(event.data);
      } catch {
        message = {type: 'message', data: event.data};
      }

      console.debug(`Message received: ${event.data}`);

      if (message.type) {
        this.emit(message.type, message.data || message);
      }

      this.emit('message', message);
    } catch (error) {
      console.error(`Error handling message: ${error}`);
    }
  }

  private processMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.ws && this.isConnected()) {
      const message = this.messageQueue.shift();
      if (message) this.send(message);
    }
  }

  private emit(event: string, data?: string | Error | Event): void {
    const handlers = this.eventHandlers.get(event);
    if (!handlers) return;

    handlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(
          `Websocket error in event handler for ${event}: ${error}`,
        );
      }
    });
  }

  private initializeHandlers() {
    this.eventHandlers.clear();
    setupChatHandlers();
    setupGameHandlers();
    setupTournamentHandlers();
  }

  public connect() {
    return new Promise<void>((resolve, reject) => {
      try {
        if (this.ws && this.isConnected()) {
          console.log('WebSocket is already connected');
          resolve();
          return;
        }

        const accessToken = localStorage.getItem('accessToken');
        if (!accessToken) {
          resolve();
          return;
        }

        console.log(`Connecting websocket to ${this.url}...`);
        this.ws = new WebSocket(this.url, [accessToken]);

        this.ws.onopen = event => {
          console.log('WebSocket connected successfully');
          this.initializeHandlers();
          this.processMessageQueue();
          this.emit('open', event);
          resolve();
        };

        this.ws.onmessage = event => {
          this.handleMessage(event);
        };

        this.ws.onclose = event => {
          console.log(`WebSocket closed: ${event.code} - ${event.reason}`);
          switch (event.code) {
            case 1006:
              console.log(
                'Authentication failed, attempting to refresh token...',
              );

              Api.getInstance()
                .refreshAccessToken()
                .then(() => {
                  console.log('Token refreshed, retrying connection...');
                  return this.connect();
                })
                .catch(err => {
                  console.error('Token refresh failed:', err);
                  reject(new Error('Authentication failed'));
                });
              break;

            case 3000:
              Router.getInstance().navigate('/');
              break;

            default:
              this.emit('close', event);
          }
        };

        this.ws.onerror = event => {
          console.error('WebSocket error occurred');
          this.emit('error', event);
          reject(new Error('WebSocket connection failed'));
        };
      } catch (error) {
        console.error(`Websocket connection error: ${error}`);
        reject(error);
      }
    });
  }

  public disconnect() {
    if (this.ws && this.isConnected()) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }

    console.log('WebSocket disconnected manually');
  }

  public send(message): boolean {
    let msg = message;
    if (typeof msg !== 'string') {
      msg = JSON.stringify({...message, timestamp: Date.now()});
    }

    if (this.ws && this.isConnected()) {
      try {
        this.ws.send(msg);
        console.debug(`Message sent: ${msg}`);
        return true;
      } catch (error) {
        console.debug(`Failed to send message: ${error}`);
        return false;
      }
    } else {
      this.messageQueue.push(msg);
      console.warn('Message queued (WebSocket not ready)');
      return false;
    }
  }

  public on(event: string, handler: (data) => void): void {
    if (!this.eventHandlers.has(event)) this.eventHandlers.set(event, []);
    this.eventHandlers.get(event)?.push(handler);
  }

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}
