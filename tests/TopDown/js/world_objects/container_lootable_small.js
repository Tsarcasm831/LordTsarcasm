import { ITEMS } from '../items.js';

export class LootableContainer {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 40;
    this.interactable = true;
    this.contents = this.generateLoot();
    this.isOpen = false;
    this.swingPhase = Math.random() * Math.PI * 2;
  }

  generateLoot() {
    const lootTable = [
      { item: 'wood', min: 3, max: 8 },
      { item: 'stone', min: 2, max: 5 }
    ];
    
    return lootTable.flatMap(entry => 
      Array.from({ length: Math.floor(Math.random() * (entry.max - entry.min + 1)) + entry.min }, 
        () => ITEMS[entry.item])
    ).filter(Boolean); // Add safety check
  }

  update(deltaTime) {
    this.swingPhase += deltaTime * 0.5;
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
    
    // Chest body with sway animation
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(-20, -10, 40, 20);
    
    // Lid with opening animation
    const lidAngle = this.isOpen ? -Math.PI/4 : Math.sin(this.swingPhase) * 0.2;
    ctx.save();
    ctx.rotate(lidAngle);
    ctx.fillStyle = '#A0522D';
    ctx.fillRect(-20, -20, 40, 10);
    ctx.restore();

    // Metal bands
    ctx.strokeStyle = '#CD7F32';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-15, -10);
    ctx.lineTo(-15, 10);
    ctx.moveTo(15, -10);
    ctx.lineTo(15, 10);
    ctx.stroke();

    // Sparkle effect
    if (Math.random() < 0.1 && !this.isOpen) {
      ctx.fillStyle = `hsla(50, 100%, 70%, ${Math.random()})`;
      ctx.beginPath();
      ctx.arc(
        -15 + Math.random() * 30,
        -15 + Math.random() * 15,
        2 + Math.random() * 3,
        0, Math.PI * 2
      );
      ctx.fill();
    }

    ctx.restore();
  }
}