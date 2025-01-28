// house_interior.js (Updated)
export class HouseInterior {
  constructor() {
    this.width = 600;  // match your interior canvas size
    this.height = 400;
    this.lightPhase = 0;
    this.curtainSway = 0;
    this.clockPhase = 0;
  }

  update(deltaTime) {
    this.lightPhase += deltaTime;
    this.curtainSway += deltaTime * 0.5;
    this.clockPhase += deltaTime * 0.1;
  }

  // Renders onto the interior overlay canvas
  render(ctx) {
    if (!ctx) {
      console.error('No context provided for house interior rendering!');
      return;
    }

    // Clear the interior canvas
    ctx.clearRect(0, 0, this.width, this.height);

    // Move the origin to the center so old code can remain similar
    ctx.save();
    ctx.translate(this.width / 2, this.height / 2);

    // Wooden floor
    for (let i = -300; i < 300; i += 40) {
      for (let j = -200; j < 200; j += 40) {
        ctx.fillStyle = `hsl(30, 50%, ${25 + Math.random() * 5}%)`;
        ctx.fillRect(i, j, 38, 38);
      }
    }

    // Walls
    ctx.fillStyle = '#deb887';
    ctx.fillRect(-300, -200, 600, 50);  // Top wall
    ctx.fillRect(-300, 150, 600, 50);   // Bottom wall
    ctx.fillRect(-300, -200, 50, 400);  // Left wall
    ctx.fillRect(250, -200, 50, 400);   // Right wall

    // Window
    ctx.fillStyle = '#87ceeb';  // Sky blue
    ctx.fillRect(100, -150, 100, 100);
    
    // Window frame
    ctx.strokeStyle = '#8b4513';  // Saddle brown
    ctx.lineWidth = 10;
    ctx.strokeRect(100, -150, 100, 100);

    // Bed
    ctx.fillStyle = '#8b4513';  // Dark wood
    ctx.fillRect(-250, -150, 120, 200);  // Bed frame
    ctx.fillStyle = '#f0e68c';  // Khaki
    ctx.fillRect(-240, -140, 100, 180);  // Mattress
    ctx.fillStyle = '#fff';     // White
    ctx.fillRect(-240, -140, 100, 60);   // Pillow

    // Table
    ctx.fillStyle = '#8b4513';
    ctx.fillRect(50, 0, 100, 100);

    // Chair
    ctx.fillStyle = '#a0522d';
    ctx.fillRect(170, 20, 40, 40);

    // Restore context
    ctx.restore();
  }
}
