// house_interior.js (Updated)
export class HouseInterior {
  constructor() {
    this.width = 320;  // Base resolution width
    this.height = 180; // Base resolution height (16:9 aspect ratio)
    this.lightPhase = 0;
    this.curtainSway = 0;
    this.clockPhase = 0;
  }

  update(deltaTime) {
    this.lightPhase += deltaTime;
    this.curtainSway += deltaTime * 0.5;
    this.clockPhase += deltaTime * 0.1;
  }

  render(ctx) {
    if (!ctx) {
      console.error('No context provided for house interior rendering!');
      return;
    }

    // Get canvas dimensions and calculate scale
    const canvas = ctx.canvas;
    const scale = Math.min(
      (canvas.width - 100) / this.width,  // Add padding
      (canvas.height - 100) / this.height
    );

    // Calculate centered position with padding
    const scaledWidth = this.width * scale;
    const scaledHeight = this.height * scale;
    const viewX = Math.floor((canvas.width - scaledWidth) / 2);
    const viewY = Math.floor((canvas.height - scaledHeight) / 2);

    // Clear the entire canvas with background color
    ctx.fillStyle = '#2b1e15';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Apply transformations
    ctx.save();
    ctx.translate(viewX, viewY);
    ctx.scale(scale, scale);

    // Set background
    ctx.fillStyle = '#3c2416';
    ctx.fillRect(0, 0, this.width, this.height);

    // Draw wooden floor pattern
    const tileSize = 20;
    for (let x = 0; x < this.width; x += tileSize) {
      for (let y = 0; y < this.height; y += tileSize) {
        ctx.fillStyle = `hsl(30, 50%, ${25 + Math.random() * 5}%)`;
        ctx.fillRect(x, y, tileSize - 1, tileSize - 1);
      }
    }

    // Draw walls
    ctx.fillStyle = '#deb887';
    const wallThickness = 20;
    
    // Top and bottom walls
    ctx.fillRect(0, 0, this.width, wallThickness);
    ctx.fillRect(0, this.height - wallThickness, this.width, wallThickness);
    
    // Left and right walls
    ctx.fillRect(0, 0, wallThickness, this.height);
    ctx.fillRect(this.width - wallThickness, 0, wallThickness, this.height);

    // Draw window
    const windowSize = 40;
    ctx.fillStyle = '#87ceeb';
    ctx.fillRect(this.width - 80, 30, windowSize, windowSize);
    
    // Window frame
    ctx.strokeStyle = '#8b4513';
    ctx.lineWidth = 4;
    ctx.strokeRect(this.width - 80, 30, windowSize, windowSize);

    // Draw bed
    const bedWidth = 60;
    const bedHeight = 80;
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(30, 30, bedWidth, bedHeight);
    
    // Mattress
    ctx.fillStyle = '#f0e68c';
    ctx.fillRect(35, 35, bedWidth - 10, bedHeight - 10);
    
    // Pillow
    ctx.fillStyle = '#fff';
    ctx.fillRect(35, 35, bedWidth - 10, 20);

    // Draw table
    const tableSize = 40;
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(this.width/2 - tableSize/2, this.height/2 - tableSize/2, tableSize, tableSize);

    // Draw chair
    const chairSize = 20;
    ctx.fillStyle = '#a0522d';
    ctx.fillRect(this.width/2 + tableSize/2 + 10, this.height/2 - chairSize/2, chairSize, chairSize);

    ctx.restore();
  }
}
