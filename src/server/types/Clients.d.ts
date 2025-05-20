type TunnelMessageType =
  | 'error'
  | 'friendRequest'
  | 'friendRequestAccepted'
  | 'hotReload';

interface TunnelMessage {
  type: TunnelMessageType;
  [key: string]: unknown;
}
