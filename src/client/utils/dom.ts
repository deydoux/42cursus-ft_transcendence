export const DOMUtils = {
  createElement<T extends keyof HTMLElementTagNameMap>(
    tag: T,
    options: {
      className?: string;
      textContent?: string;
      icon?: string;
      attributes?: Record<string, string>;
      onclick?: EventListener;
      events?: Record<string, EventListener>;
    } = {},
  ): HTMLElementTagNameMap[T] {
    const element = document.createElement(tag);

    if (options.className) element.className = options.className;
    if (options.textContent) element.textContent = options.textContent;
    if (options.icon) element.setAttribute('icon', options.icon);

    if (options.attributes) {
      Object.entries(options.attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
    }

    if (options.onclick) element.addEventListener('click', options.onclick);
    if (options.events) {
      Object.entries(options.events).forEach(([event, handler]) => {
        element.addEventListener(event, handler);
      });
    }

    return element;
  },
};

export const createElement = DOMUtils.createElement;
