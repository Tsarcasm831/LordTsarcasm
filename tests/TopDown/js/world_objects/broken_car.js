import { ITEMS } from '../items.js';

export class BrokenCar {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 80;
    this.height = 40;
    this.interactable = true;
    this.contents = this.generateLoot();
    this.isOpen = false;
    this.swingPhase = Math.random() * Math.PI * 2;
    this.smokePhase = 0;
  }

  generateLoot() {
    const lootTable = [
      { item: 'scrap_metal', min: 2, max: 5 },
      { item: 'engine_part', min: 1, max: 1 }
    ];
    
    return lootTable.flatMap(entry => 
      Array.from({ length: Math.floor(Math.random() * (entry.max - entry.min + 1)) + entry.min }, 
        () => ITEMS[entry.item])
    ).filter(Boolean);
  }

  update(deltaTime) {
    this.swingPhase += deltaTime * 0.5;
    this.smokePhase += deltaTime * 2;
  }

  checkClick(worldX, worldY) {
    return worldX > this.x - this.width/2 && 
           worldX < this.x + this.width/2 &&
           worldY > this.y - this.height/2 && 
           worldY < this.y + this.height/2;
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    
    // Car body with rust animation
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(-40, -20, 80, 40);
    
    // Rust texture
    ctx.fillStyle = `rgba(92,64,51,${0.5 + Math.sin(this.swingPhase)*0.2})`;
    ctx.beginPath();
    for(let i = 0; i < 20; i++) {
      ctx.rect(
        -40 + Math.random() * 80,
        -20 + Math.random() * 40,
        5 + Math.random() * 10,
        2 + Math.random() * 5
      );
    }
    ctx.fill();

    // Wheels with suspension effect
    ctx.fillStyle = '#333';
    [-30, 30].forEach(pos => {
      ctx.beginPath();
      ctx.arc(pos, 15 + Math.sin(this.smokePhase)*2, 10, 0, Math.PI*2);
      ctx.fill();
    });

    // Broken windows
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.fillRect(-30, -15, 60, 10);
    
    // Smoke effect
    if (!this.isOpen) {
      ctx.fillStyle = `rgba(50,50,50,${0.3 + Math.sin(this.smokePhase)*0.2})`;
      ctx.beginPath();
      ctx.arc(0, -30, 8 + Math.sin(this.smokePhase)*4, 0, Math.PI*2);
      ctx.fill();
    }

    ctx.restore();
  }
}