export class Wall {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly canvas: HTMLCanvasElement;
  private readonly height: number = 100;
  private readonly width: number = 20;
  private readonly padding: number = 20;
  private walls: {x: number; y: number}[] = [];

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
  }

  public draw(): void {
    this.ctx.fillStyle = 'brown';
    // Draw all walls vertically
    this.walls.forEach(wall => {
      this.ctx.fillRect(wall.x, wall.y, this.width, this.height);
    });
  }

  public generateRandomWalls(wallCount: number): void {
    this.walls = []; // Reset walls array

    // Create a grid system
    const gridSize = Math.sqrt(wallCount) + 1;
    const cellWidth = (this.canvas.width - this.padding * 2) / gridSize;
    const cellHeight = (this.canvas.height - this.padding * 2) / gridSize;

    // Create possible positions array
    const positions: {x: number; y: number}[] = [];

    // Generate all possible positions
    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) {
        positions.push({
          x: this.padding + cellWidth * i + (cellWidth - this.width) / 2,
          y: this.padding + cellHeight * j + (cellHeight - this.height) / 2,
        });
      }
    }

    // Shuffle array to get random positions
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }

    // Take first wallCount positions
    this.walls = positions.slice(0, wallCount);
  }

  public isColliding(x: number, y: number, radius: number): boolean {
    return this.walls.some(wall => {
      // Check if point (with radius) intersects with wall rectangle
      const distX = Math.abs(x - (wall.x + this.width / 2));
      const distY = Math.abs(y - (wall.y + this.height / 2));

      if (distX > this.width / 2 + radius) return false;
      if (distY > this.height / 2 + radius) return false;

      if (distX <= this.width / 2) return true;
      if (distY <= this.height / 2) return true;

      // Check corner collision
      const dx = distX - this.width / 2;
      const dy = distY - this.height / 2;
      return dx * dx + dy * dy <= radius * radius;
    });
  }

  // Add method to check car collision
  public isCarColliding(car: {
    x: number;
    y: number;
    width: number;
    height: number;
  }): boolean {
    return this.walls.some(wall => {
      // Rectangle collision detection
      return !(
        car.x > wall.x + this.width ||
        car.x + car.width < wall.x ||
        car.y > wall.y + this.height ||
        car.y + car.height < wall.y
      );
    });
  }

  public getWalls(): {x: number; y: number}[] {
    return this.walls;
  }
}
