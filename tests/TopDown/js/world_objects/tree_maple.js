import { GatherTree } from './gather_tree.js';

export class MapleTree extends GatherTree {
  constructor(x, y) {
    super(x, y, 'maple', {
      width: 60,
      height: 100,
      health: 8,
      swingSpeed: 0.6,
      baseColor: '#8B4513',
      leafColor: '#d79b70'
    });
    this.treeType = 'Deciduous';
    this.description = 'Seasonal syrup source';
    this.seasonalHue = Math.random() * 30;
  }

  update(deltaTime) {
    super.update(deltaTime);
    this.seasonalHue = (this.seasonalHue + deltaTime * 10) % 360;
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    
    // Trunk with curved base
    ctx.fillStyle = this.baseColor;
    ctx.beginPath();
    ctx.moveTo(-8, 0);
    ctx.quadraticCurveTo(0, -20, 8, 0);
    ctx.lineTo(8, -80);
    ctx.quadraticCurveTo(0, -100, -8, -80);
    ctx.closePath();
    ctx.fill();

    this.renderCanopy(ctx);

    ctx.restore();
  }

  renderCanopy(ctx) {
    ctx.save();
    
    const leafColor = `hsl(${this.seasonalHue}, 70%, 45%)`;
    const branchSway = Math.sin(this.swingPhase) * 5;
    
    // Main canopy positioned relative to trunk
    ctx.fillStyle = leafColor;
    ctx.beginPath();
    ctx.arc(0 + branchSway, -90, 40, 0, Math.PI * 2);      // Lower canopy
    ctx.arc(0 - branchSway*0.8, -120, 35, 0, Math.PI * 2); // Middle canopy
    ctx.arc(0 + branchSway*0.6, -150, 30, 0, Math.PI * 2); // Upper canopy
    ctx.fill();

    // Connecting branches
    ctx.strokeStyle = '#5C4033';
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(-30, -80);
    ctx.quadraticCurveTo(-15 + branchSway, -100, 0, -120);
    ctx.moveTo(30, -80);
    ctx.quadraticCurveTo(15 - branchSway, -100, 0, -120);
    ctx.stroke();

    ctx.restore();
  }

  getTooltipContent() {
    const baseContent = super.getTooltipContent();
    return {
      ...baseContent,
      extraInfo: `Foliage hue: ${Math.round(this.seasonalHue)}°`
    };
  }

  checkClick(worldX, worldY) {
    return worldX > this.x - this.width/2 && 
           worldX < this.x + this.width/2 &&
           worldY > this.y - this.height/2 && 
           worldY < this.y + this.height/2;
  }
}