export class Timer {
  private startTime: number;
  private elapsedTime: number;
  private isRunning: boolean;
  private duration: number;

  constructor() {
    this.startTime = 0;
    this.elapsedTime = 0;
    this.isRunning = false;
    this.duration = 2 * 60 * 1000; // Default duration of 2 minutes
  }

  public start(): void {
    if (!this.isRunning) {
      this.isRunning = true;
      this.startTime = Date.now() - this.elapsedTime;
    }
  }

  public stop(): void {
    if (this.isRunning) {
      this.isRunning = false;
      this.elapsedTime = Date.now() - this.startTime;
    }
  }

  public reset(): void {
    this.elapsedTime = 0;
    this.isRunning = false;
    this.startTime = 0;
  }

  public getElapsedTime(): number {
    if (this.isRunning) {
      return Date.now() - this.startTime;
    }
    return this.elapsedTime;
  }

  public getRemainingTime(): number {
    if (this.duration === 0) return 0;
    const remaining = this.duration - this.getElapsedTime();
    return remaining > 0 ? remaining : 0;
  }

  public isTimeUp(): boolean {
    return this.duration > 0 && this.getElapsedTime() >= this.duration;
  }

  public formatTime(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
