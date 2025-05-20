type TunnelMessageType = 'error' | 'hotReload';

interface TunnelMessage {
  type: TunnelMessageType;
  [key: string]: unknown;
}
