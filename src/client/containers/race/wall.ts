export class Wall {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly canvas: HTMLCanvasElement;
  private gridSpacing = 100; // Default grid spacing
  private readonly wallThickness: number = 8;
  private walls: {x: number; y: number; width: number; height: number}[] = [];

  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.canvas = ctx.canvas;
  }

  public setGridSpacing(spacing: number): void {
    this.gridSpacing = spacing;
  }

  public draw(): void {
    this.walls.forEach(wall => {
      this.drawNeonWall(wall.x, wall.y, wall.width, wall.height);
    });
  }

  private drawNeonWall(
    x: number,
    y: number,
    width: number,
    height: number,
  ): void {
    // Set up neon styling for walls
    this.ctx.fillStyle = '#FF3131'; // Bright cyan-blue
    this.ctx.shadowColor = '#FF3131';
    this.ctx.shadowBlur = 15;
    this.ctx.globalCompositeOperation = 'screen';

    // Draw main wall body
    this.ctx.fillRect(x, y, width, height);

    // Add brighter core
    this.ctx.fillStyle = '#de2929';
    this.ctx.shadowBlur = 8;
    this.ctx.fillRect(x + 1, y + 1, width - 2, height - 2);

    // Reset canvas state
    this.ctx.shadowBlur = 0;
    this.ctx.globalCompositeOperation = 'source-over';
  }

  public generateRandomWalls(
    wallCount: number,
    canvasWidth?: number,
    canvasHeight?: number,
  ): void {
    const width = canvasWidth || this.canvas.width;
    const height = canvasHeight || this.canvas.height;

    // Calculate grid spacing to match the Track class
    this.gridSpacing = height / 9; // Adjust divisor to control grid density

    this.walls = []; // Reset walls array

    // Calculate grid dimensions
    const verticalLines = Math.floor(width / this.gridSpacing);
    const horizontalLines = Math.floor(height / this.gridSpacing);

    // Create possible wall positions along grid lines
    const verticalWallPositions: {
      x: number;
      y: number;
      width: number;
      height: number;
    }[] = [];
    const horizontalWallPositions: {
      x: number;
      y: number;
      width: number;
      height: number;
    }[] = [];

    // Generate vertical walls (along vertical grid lines)
    for (let i = 1; i < verticalLines; i++) {
      // Skip first and last lines
      const x = i * this.gridSpacing - this.wallThickness / 2;
      for (let j = 1; j < horizontalLines; j++) {
        const y = j * this.gridSpacing;
        verticalWallPositions.push({
          x: x,
          y: y,
          width: this.wallThickness,
          height: this.gridSpacing,
        });
      }
    }

    // Generate horizontal walls (along horizontal grid lines)
    for (let j = 1; j < horizontalLines; j++) {
      // Skip first and last lines
      const y = j * this.gridSpacing - this.wallThickness / 2;
      for (let i = 1; i < verticalLines; i++) {
        const x = i * this.gridSpacing;
        horizontalWallPositions.push({
          x: x,
          y: y,
          width: this.gridSpacing,
          height: this.wallThickness,
        });
      }
    }

    // Combine all positions
    const allPositions = [...verticalWallPositions, ...horizontalWallPositions];

    // Shuffle array to get random positions
    for (let i = allPositions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allPositions[i], allPositions[j]] = [allPositions[j], allPositions[i]];
    }

    // Take first wallCount positions
    this.walls = allPositions.slice(
      0,
      Math.min(wallCount, allPositions.length),
    );
  }

  public isColliding(x: number, y: number, radius: number): boolean {
    return this.walls.some(wall => {
      // Check if point (with radius) intersects with wall rectangle
      const distX = Math.abs(x - (wall.x + wall.width / 2));
      const distY = Math.abs(y - (wall.y + wall.height / 2));

      if (distX > wall.width / 2 + radius) return false;
      if (distY > wall.height / 2 + radius) return false;
      if (distX <= wall.width / 2) return true;
      if (distY <= wall.height / 2) return true;

      // Check corner collision
      const dx = distX - wall.width / 2;
      const dy = distY - wall.height / 2;
      return dx * dx + dy * dy <= radius * radius;
    });
  }

  /**
   * Checks if a car is outside the canvas boundaries
   * @param car The car object with position and dimensions
   * @returns true if out of bounds, false otherwise
   */
  private isOutOfBounds(car: {
    x: number;
    y: number;
    width: number;
    height: number;
  }): boolean {
    const padding = 5; // Small padding to prevent getting stuck at edges
    return (
      car.x - car.width / 2 < padding ||
      car.x + car.width / 2 > this.canvas.width - padding ||
      car.y - car.height / 2 < padding ||
      car.y + car.height / 2 > this.canvas.height - padding
    );
  }

  public isCarColliding(car: {
    x: number;
    y: number;
    width: number;
    height: number;
  }): boolean {
    return this.walls.some(wall => {
      // Rectangle collision detection (AABB - Axis Aligned Bounding Box)
      return (
        car.x < wall.x + wall.width &&
        car.x + car.width > wall.x &&
        car.y < wall.y + wall.height &&
        car.y + car.height > wall.y
      );
    });
  }

  public getWalls(): {x: number; y: number; width: number; height: number}[] {
    return this.walls;
  }
}
