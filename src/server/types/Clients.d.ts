type TunnelMessageType = 'close' | 'error' | 'hotReload';

interface TunnelMessage {
  type: TunnelMessageType;
  [key: string]: unknown;
}
