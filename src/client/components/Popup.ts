import {DOMUtils} from '../utils/dom';

export interface Popup {
  show: () => void;
  hide: () => void;
  destroy: () => void;
  updatePosition: (newX: number, newY: number) => void;
  updateContent: (newContent: string) => void;
  visible: () => void;
  getElement: () => void;
  remove: () => void;
  close: () => void;
  open: () => void;
  display: () => void;
}

interface PopupOptions {
  x?: number;
  y?: number;
  className?: string;
  content?: HTMLElement;
  parent?: HTMLElement;
  onClose?: () => void;
  preventScroll?: boolean;
  closeOnEscape?: boolean;
}

export const createPopupContainer = (options: PopupOptions = {}): Popup => {
  const {
    x = 0,
    y = 0,
    className = 'absolute bg-white rounded shadow-lg border z-50',
    content = DOMUtils.createElement('div'),
    parent = document.querySelector('#root'),
    onClose = null,
    preventScroll = true,
    closeOnEscape = true,
  } = options;

  let container: HTMLElement | null = null;
  let isVisible = false;

  function create() {
    if (container) return container;

    container = document.createElement('div');
    container.className = className;
    container.style.cssText = `left: ${x}px; top: ${y}px; position: absolute;`;
    container.appendChild(content);

    return container;
  }

  function show() {
    if (isVisible) return;

    create();

    if (parent && container) {
      parent.appendChild(container);
    }

    if (preventScroll) {
      document.body.style.overflow = 'hidden';
    }

    isVisible = true;

    setTimeout(() => {
      document.addEventListener('click', handleClickOutside, true);
      document.addEventListener('contextmenu', handleClickOutside, true);

      if (closeOnEscape) {
        document.addEventListener('keydown', handleEscapeKey);
      }
    }, 0);

    return container;
  }

  function hide() {
    if (!isVisible || !container) return;

    if (container.parentNode) {
      container.parentNode.removeChild(container);
    }

    if (preventScroll) {
      document.body.style.overflow = '';
    }

    isVisible = false;

    document.removeEventListener('click', handleClickOutside, true);
    document.removeEventListener('contextmenu', handleClickOutside, true);
    document.removeEventListener('keydown', handleEscapeKey);

    if (onClose) {
      onClose();
    }
  }

  function destroy() {
    hide();
    container = null;
  }

  function updatePosition(newX: number, newY: number) {
    if (container) {
      container.style.left = `${newX}px`;
      container.style.top = `${newY}px`;
    }
  }

  function updateContent(newContent: string) {
    if (container) {
      container.innerHTML = newContent;
    }
  }

  function visible() {
    return isVisible;
  }

  function getElement() {
    return container;
  }

  function handleClickOutside(evt) {
    if (container && !container.contains(evt.target)) {
      evt.preventDefault();
      evt.stopPropagation();
      evt.stopImmediatePropagation();
      hide();
    }
  }

  function handleEscapeKey(evt) {
    if (evt.key === 'Escape') {
      hide();
    }
  }

  return {
    show,
    hide,
    destroy,
    updatePosition,
    updateContent,
    visible,
    getElement,
    // Aliases for convenience
    remove: hide,
    close: hide,
    open: show,
    display: show,
  };
};
