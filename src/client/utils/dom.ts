export class DOMUtils {
  static createElement<T extends keyof HTMLElementTagNameMap>(
    tag: T,
    options: {
      className?: string;
      textContent?: string;
      attributes?: Record<string, string>;
      events?: Record<string, EventListener>;
    } = {}
  ): HTMLElementTagNameMap[T] {
    const element = document.createElement(tag);
    
    if (options.className) element.className = options.className;
    if (options.textContent) element.textContent = options.textContent;
    
    if (options.attributes) {
      Object.entries(options.attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
    }
    
    if (options.events) {
      Object.entries(options.events).forEach(([event, handler]) => {
        element.addEventListener(event, handler);
      });
    }
    
    return element;
  }
}
