import {Toast, ToastOptions} from '../types/toastify';
import {DOMUtils} from './dom';

export class Toastify {
  private static instance: Toastify;
  private container: HTMLElement;
  private toasts: Map<string, Toast> = new Map<string, Toast>();
  private toastCounter = 0;

  private constructor() {
    this.createContainer();
  }

  static getInstance(): Toastify {
    if (!Toastify.instance) {
      Toastify.instance = new Toastify();
    }
    return Toastify.instance;
  }

  // Static convenience methods
  static success(
    message: string | HTMLElement,
    options?: Omit<ToastOptions, 'message' | 'type'>,
  ): string {
    return Toastify.getInstance().show({message, type: 'success', ...options});
  }

  static error(
    message: string | HTMLElement,
    options?: Omit<ToastOptions, 'message' | 'type'>,
  ): string {
    return Toastify.getInstance().show({message, type: 'error', ...options});
  }

  static warning(
    message: string | HTMLElement,
    options?: Omit<ToastOptions, 'message' | 'type'>,
  ): string {
    return Toastify.getInstance().show({message, type: 'warning', ...options});
  }

  static info(
    message: string | HTMLElement,
    options?: Omit<ToastOptions, 'message' | 'type'>,
  ): string {
    return Toastify.getInstance().show({message, type: 'info', ...options});
  }

  static dismiss(toastId: string): void {
    Toastify.getInstance().hide(toastId);
  }

  static dismissAll(): void {
    Toastify.getInstance().hideAll();
  }

  show(options: ToastOptions): string {
    const {
      message,
      type = 'info',
      duration = 4000,
      closable = true,
      position = 'top-right',
      actionButtons = [],
      onClick = undefined,
    } = options;

    const toastId = this.generateId();
    const toastElement = this.createToastElement(
      message,
      type,
      closable,
      actionButtons,
      toastId,
      onClick,
    );

    // Update container position if needed
    this.updateContainerPosition(position);

    // Add to container
    this.container.appendChild(toastElement);

    // Store toast reference
    const toast: Toast = {
      id: toastId,
      element: toastElement,
    };

    // Auto-hide after duration
    if (duration > 0) {
      toast.timeout = setTimeout(() => {
        this.hide(toastId);
      }, duration);
    }

    this.toasts.set(toastId, toast);

    // Trigger animation
    requestAnimationFrame(() => {
      toastElement.classList.add('toast-show');
    });

    return toastId;
  }

  hide(toastId: string): void {
    const toast = this.toasts.get(toastId);
    if (!toast) return;

    // Clear timeout
    if (toast.timeout) {
      clearTimeout(toast.timeout);
    }

    // Animate out
    toast.element.classList.add('toast-hide');

    // Remove after animation
    setTimeout(() => {
      if (toast.element.parentNode) {
        toast.element.parentNode.removeChild(toast.element);
      }
      this.toasts.delete(toastId);
    }, 300);
  }

  hideAll(): void {
    this.toasts.forEach((_, toastId) => {
      this.hide(toastId);
    });
  }

  private generateId(): string {
    return `toast-${++this.toastCounter}-${Date.now()}`;
  }

  private createContainer(): void {
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    this.container.setAttribute('aria-live', 'polite');
    this.container.setAttribute('aria-atomic', 'true');
    document.body.appendChild(this.container);
  }

  private updateContainerPosition(position: string): void {
    this.container.className = `toast-container toast-${position}`;
  }

  private createToastElement(
    content: string | HTMLElement,
    type: string,
    closable: boolean,
    actionButtons: HTMLButtonElement[],
    toastId: string,
    onClick?: (toatID: string) => void,
  ): HTMLElement {
    const toast = DOMUtils.createElement('div', {
      className: `toast toast-${type}`,
      attributes: {
        role: 'alert',
        'aria-live': 'assertive',
      },
    });

    const container = DOMUtils.createElement('div', {
      className: `toast-content ${onClick ? 'cursor-pointer' : ''}`,
    });

    if (onClick) {
      container.onclick = () => onClick(toastId);
    }

    if (typeof content === 'string') {
      container.appendChild(
        DOMUtils.createElement('span', {
          className: 'toast-text',
          textContent: content,
        }),
      );
    } else {
      container.appendChild(content);
    }

    toast.appendChild(container);

    if (closable) {
      const closeButton = DOMUtils.createElement('button', {
        className: 'toast-close',
        textContent: '×',
        attributes: {
          'aria-label': 'Close notification',
        },
        onclick: () => this.hide(toastId),
      });

      toast.appendChild(closeButton);
    } else if (actionButtons.length > 0) {
      const buttons = DOMUtils.createElement('div', {
        className: 'flex items-center ml-4 gap-2',
      });

      actionButtons.forEach(b => buttons.appendChild(b));
      toast.appendChild(buttons);
    }

    return toast;
  }
}
