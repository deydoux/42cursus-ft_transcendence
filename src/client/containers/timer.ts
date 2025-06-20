export class Timer {
  private startTime: number;
  private elapsedTime: number;
  private duration: number;

  public isRunning: boolean;

  // Game Start Countdown properties
  private countdownStart: number;
  private countdownDuration: number;
  private isCountingDown: boolean;

  constructor() {
    this.startTime = 0;
    this.elapsedTime = 0;
    this.isRunning = false;
    this.duration = 1 * 60 * 1000; // 3 minutes

    this.isCountingDown = false;
    this.countdownDuration = 3000; // 3second
    this.countdownStart = 0;
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
    this.isCountingDown = false;
    this.countdownStart = 0;
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

  // NEW: Game Start Countdown methods
  public startCountdown(): void {
    this.countdownStart = Date.now();
    this.isCountingDown = true;
  }

  public getCountdownMessage(): string | null {
    if (!this.isCountingDown) return null;

    const elapsed = Date.now() - this.countdownStart;
    const remaining = Math.ceil((this.countdownDuration - elapsed) / 1000);

    if (remaining > 0) {
      return remaining.toString();
    } else if (elapsed < this.countdownDuration + 1000) {
      return 'GO!';
    } else {
      this.isCountingDown = false;
      return null;
    }
  }

  public isCountdownFinished(): boolean {
    if (!this.isCountingDown) return false;
    return Date.now() - this.countdownStart > this.countdownDuration + 1000;
  }

  public isCountdownActive(): boolean {
    return this.isCountingDown;
  }

  //Countdown timer methods (counts down remaining time)
  public getRemainingTimeFormatted(): string {
    return this.formatTime(this.getRemainingTime());
  }

  public getRemainingSeconds(): number {
    return Math.ceil(this.getRemainingTime() / 1000);
  }

  public getRemainingMinutes(): number {
    return Math.floor(this.getRemainingTime() / (60 * 1000));
  }

  // Utility method to set custom countdown duration
  public setCountdownDuration(seconds: number): void {
    this.countdownDuration = seconds * 1000;
  }

  // Method to check if countdown should show warning (last 10 seconds)
  public isCountdownWarning(): boolean {
    return this.getRemainingSeconds() <= 10 && this.getRemainingSeconds() > 0;
  }

  // Method to get countdown state for styling
  public getCountdownState(): 'normal' | 'warning' | 'critical' {
    const remaining = this.getRemainingSeconds();
    if (remaining <= 10) return 'critical';
    if (remaining <= 30) return 'warning';
    return 'normal';
  }

  public formatTime(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
