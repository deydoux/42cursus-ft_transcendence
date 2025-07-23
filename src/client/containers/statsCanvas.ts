import race_bd from '../assets/race_track.png';

export class StatsCanvas {
  private ctx_race: CanvasRenderingContext2D;
  private ctx_pong: CanvasRenderingContext2D;

  constructor(
    ctx_race: CanvasRenderingContext2D,
    ctx_pong: CanvasRenderingContext2D,
  ) {
    this.ctx_pong = ctx_pong;
    this.ctx_race = ctx_race;
  }

  bandrollRace(): void {
    const img = new Image();
    img.onload = () => {
      // Calculate scaling to maintain aspect ratio
      const scale = Math.min(
        this.ctx_race.canvas.width / img.width,
        this.ctx_race.canvas.height / img.height,
      );

      // Calculate centered position
      const x = (this.ctx_race.canvas.width - img.width * scale) / 2;
      const y = (this.ctx_race.canvas.height - img.height * scale) / 2;

      // Clear canvas and draw scaled image
      this.ctx_race.clearRect(
        0,
        0,
        this.ctx_race.canvas.width,
        this.ctx_race.canvas.height,
      );
      this.ctx_race.drawImage(img, x, y, img.width * scale, img.height * scale);
    };
    img.src = race_bd;
  }
}
