export interface ToastOptions {
  message: string;
  user?: {username: string; avatar: string};
  type?: 'success' | 'error' | 'warning' | 'info' | 'message';
  duration?: number; // in milliseconds
  closable?: boolean;
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center';
}

export interface Toast {
  id: string;
  element: HTMLElement;
  timeout?: NodeJS.Timeout;
}
