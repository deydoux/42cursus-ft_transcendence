// import {html} from '../utils/html.ts';

export class Announcement {
  private element: HTMLElement;

  constructor(element: HTMLElement) {
    this.element = element;
  }

  public displayMessage(message: string): void {
    this.element.innerText = message;
  }

  public clear(): void {
    this.element.innerText = '';
  }
}
