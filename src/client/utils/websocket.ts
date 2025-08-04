import {
  WebSocketConfig,
  WebSocketEventHandler,
  WebSocketMessage,
  WebSocketState,
} from '../types/websocket';
import {setupGameHandlers} from '../handlers/game';

class WebSocketUtility {
  private ws: WebSocket | null = null;
  private config: Required<WebSocketConfig>;
  private eventHandlers = new Map<string, WebSocketEventHandler[]>();
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isManualClose = false;
  private messageQueue: WebSocketMessage[] = [];
  private isReconnecting = false;

  constructor(config: WebSocketConfig) {
    this.config = {
      url: config.url,
      protocols: config.protocols || [],
      reconnectInterval: config.reconnectInterval || 3000,
      maxReconnectAttempts: config.maxReconnectAttempts || 5,
      debug: config.debug || false,
    };
  }

  /**
   * Connect to the WebSocket server
   */
  public connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        if (this.ws && this.isConnected()) {
          this.log('WebSocket is already connected');
          resolve();
          return;
        }

        this.log(`Connecting to ${this.config.url}...`);
        this.ws = new WebSocket(this.config.url, this.config.protocols);

        this.ws.onopen = event => {
          this.log('WebSocket connected successfully');
          this.reconnectAttempts = 0;
          this.isReconnecting = false;
          this.processMessageQueue();
          this.emit('open', event);
          resolve();
        };

        this.ws.onmessage = event => {
          this.handleMessage(event);
        };

        this.ws.onclose = event => {
          this.log(`WebSocket closed: ${event.code} - ${event.reason}`);
          this.emit('close', event);

          if (!this.isManualClose && !this.isReconnecting) {
            this.attemptReconnect();
          }
        };

        this.ws.onerror = event => {
          this.log('WebSocket error occurred');
          this.emit('error', event);
          reject(new Error('WebSocket connection failed'));
        };
      } catch (error) {
        this.log(`Connection error: ${error}`);
        reject(error);
      }
    });
  }

  /**
   * Disconnect from the WebSocket server
   */
  public disconnect(): void {
    this.isManualClose = true;
    this.clearReconnectTimer();

    if (this.ws) {
      if (this.isConnected()) {
        this.ws.close(1000, 'Manual disconnect');
      }
      this.ws = null;
    }

    this.log('WebSocket disconnected manually');
  }

  /**
   * Send a message through the WebSocket
   */
  public send(message: WebSocketMessage | string): boolean {
    const msg =
      typeof message === 'string'
        ? message
        : JSON.stringify({...message, timestamp: Date.now()});

    if (this.ws && this.isConnected()) {
      try {
        this.ws.send(msg);
        this.log(`Message sent: ${msg}`);
        return true;
      } catch (error) {
        this.log(`Failed to send message: ${error}`);
        return false;
      }
    } else {
      // Queue message if not connected
      if (typeof message !== 'string') {
        this.messageQueue.push(message);
        this.log('Message queued (WebSocket not ready)');
      }
      return false;
    }
  }

  /**
   * Add event listener
   */
  public on(event: string, handler: WebSocketEventHandler): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)?.push(handler);
  }

  /**
   * Remove event listener
   */
  public off(event: string, handler?: WebSocketEventHandler): void {
    if (!this.eventHandlers.has(event)) return;

    if (handler) {
      const handlers = this.eventHandlers.get(event);
      const index = handlers?.indexOf(handler) ?? -1;
      if (index > -1) {
        handlers?.splice(index, 1);
      }
    } else {
      this.eventHandlers.delete(event);
    }
  }

  /**
   * Emit event to all listeners
   */
  private emit(event: string, data?: string | Error | Event): void {
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      handlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          this.log(`Error in event handler for ${event}: ${error}`);
        }
      });
    }
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(event: MessageEvent): void {
    try {
      let parsedData;

      try {
        parsedData = JSON.parse(event.data);
      } catch {
        // If parsing fails, treat as plain text
        parsedData = {type: 'message', data: event.data};
      }

      this.log(`Message received: ${event.data}`);

      // Emit specific event type if available
      if (parsedData.type) {
        this.emit(parsedData.type, parsedData.data || parsedData);
      }

      // Always emit generic message event
      this.emit('message', parsedData);
    } catch (error) {
      this.log(`Error handling message: ${error}`);
      this.emit('error', new Error(`Message parsing failed: ${error}`));
    }
  }

  /**
   * Attempt to reconnect
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      this.log('Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
      return;
    }

    this.isReconnecting = true;
    this.reconnectAttempts++;

    this.log(
      `Reconnection attempt ${this.reconnectAttempts}/${this.config.maxReconnectAttempts} in ${this.config.reconnectInterval}ms`,
    );

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        this.log(`Reconnection failed: ${error}`);
        this.attemptReconnect();
      });
    }, this.config.reconnectInterval);
  }

  /**
   * Clear reconnection timer
   */
  private clearReconnectTimer(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  /**
   * Process queued messages
   */
  private processMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.ws && this.isConnected()) {
      const message = this.messageQueue.shift() ?? '';
      this.send(message);
    }
  }

  /**
   * Get current connection state
   */
  public getState(): WebSocketState {
    return this.ws ? this.ws.readyState : WebSocketState.CLOSED;
  }

  /**
   * Check if WebSocket is connected
   */
  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * Get connection statistics
   */
  public getStats() {
    return {
      state: this.getState(),
      reconnectAttempts: this.reconnectAttempts,
      isReconnecting: this.isReconnecting,
      queuedMessages: this.messageQueue.length,
      url: this.config.url,
    };
  }

  /**
   * Clear message queue
   */
  public clearMessageQueue(): void {
    this.messageQueue = [];
    this.log('Message queue cleared');
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<WebSocketConfig>): void {
    this.config = {...this.config, ...newConfig};
    this.log('Configuration updated');
  }

  /**
   * Debug logging
   */
  private log(message: string): void {
    if (this.config.debug) {
      console.log(`[WebSocketUtility] ${new Date().toISOString()}: ${message}`);
    }
  }

  /**
   * Cleanup resources
   */
  public destroy(): void {
    this.disconnect();
    this.eventHandlers.clear();
    this.messageQueue = [];
    this.clearReconnectTimer();
    this.log('WebSocketUtility destroyed');
  }
}

export const socket = new WebSocketUtility({
  url: '/api/tunnel',
  protocols: [localStorage.getItem('accessToken') ?? ''],
  reconnectInterval: 3000,
  maxReconnectAttempts: 3,
  debug: true,
});

setupGameHandlers();
