export interface ToastOptions {
  message: string | HTMLElement;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number; // in milliseconds
  closable?: boolean;
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center';
  actionButtons?: HTMLButtonElement[];
  onClick?: (toastID: string) => void;
}

export interface Toast {
  id: string;
  element: HTMLElement;
  timeout?: NodeJS.Timeout;
}
