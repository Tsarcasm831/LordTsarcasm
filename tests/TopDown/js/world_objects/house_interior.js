export class HouseInterior {
  constructor(originalX, originalY) {
    this.originalX = originalX;
    this.originalY = originalY;
    this.x = 2000; // Special interior coordinates
    this.y = 2000;
    this.doorX = this.x;
    this.doorY = this.y + 150;
    this.width = 600;
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

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Wooden floor
    ctx.fillStyle = '#8B4513';
    for(let i = -300; i < 300; i += 40) {
      for(let j = -200; j < 200; j += 40) {
        ctx.fillStyle = `hsl(30, 50%, ${25 + Math.random() * 5}%)`;
        ctx.fillRect(i, j, 38, 38);
      }
    }

    // Walls with wallpaper
    ctx.fillStyle = '#deb887';
    ctx.fillRect(-300, -200, 600, 400);
    
    // Wallpaper pattern
    ctx.strokeStyle = '#cd853f';
    ctx.lineWidth = 2;
    for(let i = -300; i < 300; i += 50) {
      for(let j = -200; j < 200; j += 50) {
        ctx.beginPath();
        ctx.moveTo(i, j);
        ctx.lineTo(i + 50, j);
        ctx.moveTo(i, j);
        ctx.lineTo(i, j + 50);
        ctx.stroke();
      }
    }

    // Windows with curtains
    [-200, 200].forEach(x => {
      // Window frame
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(x - 40, -150, 80, 100);
      
      // Window glass with outdoor light
      ctx.fillStyle = `rgba(135, 206, 235, ${0.7 + Math.sin(this.lightPhase) * 0.3})`;
      ctx.fillRect(x - 35, -145, 70, 90);
      
      // Curtains
      ctx.fillStyle = '#FFE4B5';
      ctx.beginPath();
      ctx.moveTo(x - 40, -150);
      ctx.quadraticCurveTo(
        x - 20 + Math.sin(this.curtainSway) * 5, 
        -100,
        x - 40, 
        -50
      );
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + 40, -150);
      ctx.quadraticCurveTo(
        x + 20 + Math.sin(this.curtainSway + Math.PI) * 5, 
        -100,
        x + 40, 
        -50
      );
      ctx.fill();
    });

    // Furniture
    this.renderBed(ctx);
    this.renderTable(ctx);
    this.renderCabinet(ctx);
    this.renderClock(ctx);
    
    // Exit door
    ctx.fillStyle = '#5C4033';
    ctx.fillRect(-30, 150, 60, 80);
    ctx.fillStyle = '#CD7F32';
    ctx.beginPath();
    ctx.arc(20, 190, 5, 0, Math.PI*2);
    ctx.fill();

    ctx.restore();
  }

  renderBed(ctx) {
    // Bed frame
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(-250, -150, 120, 80);
    
    // Mattress
    ctx.fillStyle = '#F5F5DC';
    ctx.fillRect(-245, -155, 110, 70);
    
    // Pillow
    ctx.fillStyle = '#FFF';
    ctx.fillRect(-235, -145, 30, 20);
    
    // Blanket
    ctx.fillStyle = '#6B8E23';
    ctx.fillRect(-245, -125, 110, 40);
  }

  renderTable(ctx) {
    // Table top
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, -100, 100, 60);
    
    // Table legs
    ctx.fillRect(10, -40, 10, 40);
    ctx.fillRect(80, -40, 10, 40);
    
    // Items on table
    ctx.fillStyle = '#DDD';
    ctx.beginPath();
    ctx.arc(30, -70, 10, 0, Math.PI*2); // Plate
    ctx.fill();
    
    ctx.fillStyle = '#964B00';
    ctx.fillRect(60, -80, 20, 30); // Book
  }

  renderCabinet(ctx) {
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(150, -180, 80, 160);
    
    // Cabinet doors
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(155, -175, 70, 70);
    ctx.fillRect(155, -95, 70, 70);
    
    // Handles
    ctx.fillStyle = '#CD7F32';
    ctx.beginPath();
    ctx.arc(215, -140, 5, 0, Math.PI*2);
    ctx.arc(215, -60, 5, 0, Math.PI*2);
    ctx.fill();
  }

  renderClock(ctx) {
    // Clock body
    ctx.fillStyle = '#8B4513';
    ctx.beginPath();
    ctx.arc(0, -150, 20, 0, Math.PI*2);
    ctx.fill();
    
    // Clock face
    ctx.fillStyle = '#FFF';
    ctx.beginPath();
    ctx.arc(0, -150, 18, 0, Math.PI*2);
    ctx.fill();
    
    // Clock hands
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, -150);
    ctx.lineTo(
      Math.cos(this.clockPhase) * 15,
      -150 + Math.sin(this.clockPhase) * 15
    );
    ctx.moveTo(0, -150);
    ctx.lineTo(
      Math.cos(this.clockPhase * 12) * 10,
      -150 + Math.sin(this.clockPhase * 12) * 10
    );
    ctx.stroke();
  }

  checkExitClick(worldX, worldY) {
    const doorLeft = this.doorX - 30;
    const doorRight = this.doorX + 30;
    const doorTop = this.doorY;
    const doorBottom = this.doorY + 80;
    
    return worldX >= doorLeft && worldX <= doorRight && 
           worldY >= doorTop && worldY <= doorBottom;
  }
}