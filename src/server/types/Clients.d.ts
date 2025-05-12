type TunnelMessageType = 'close' | 'error' | 'hotReload' | 'relationship';

interface TunnelMessage {
  type: TunnelMessageType;
  [key: string]: unknown;
}
