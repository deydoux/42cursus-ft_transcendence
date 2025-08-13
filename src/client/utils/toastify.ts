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
    message: string,
    options?: Omit<ToastOptions, 'message' | 'type'>,
  ): string {
    return Toastify.getInstance().show({message, type: 'success', ...options});
  }

  static error(
    message: string,
    options?: Omit<ToastOptions, 'message' | 'type'>,
  ): string {
    return Toastify.getInstance().show({message, type: 'error', ...options});
  }

  static warning(
    message: string,
    options?: Omit<ToastOptions, 'message' | 'type'>,
  ): string {
    return Toastify.getInstance().show({message, type: 'warning', ...options});
  }

  static info(
    message: string,
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
    } = options;

    const toastId = this.generateId();
    const toastElement = this.createToastElement(
      message,
      type,
      closable,
      toastId,
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
    message: string,
    type: string,
    closable: boolean,
    toastId: string,
  ): HTMLElement {
    const toast = DOMUtils.createElement('div', {
      className: `toast toast-${type}`,
      attributes: {
        role: 'alert',
        'aria-live': 'assertive',
      },
    });

    // Create content
    const content = DOMUtils.createElement('div', {
      className: 'toast-content',
    });

    content.appendChild(
      DOMUtils.createElement('span', {
        className: 'toast-message',
        textContent: message,
      }),
    );

    toast.appendChild(content);

    // Close button
    if (closable) {
      const closeButton = DOMUtils.createElement('button', {
        className: 'toast-close',
        textContent: '×',
        attributes: {
          'aria-label': 'Close notification',
        },
        events: {
          click: () => this.hide(toastId),
        },
      });

      toast.appendChild(closeButton);
    }

    return toast;
  }
}
