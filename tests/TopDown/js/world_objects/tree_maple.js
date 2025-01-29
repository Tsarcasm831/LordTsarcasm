import { GatherTree } from './gather_tree.js';

export class MapleTree extends GatherTree {
  constructor(x, y) {
    super(x, y - 20, 'maple', {
      width: 50,
      height: 40,
      health: 8,
      baseColor: '#8B4513',
      leafColor: '#d79b70'
    });
    this.treeType = 'Deciduous';
    this.description = 'Seasonal syrup source';
    this.collidable = true;
    
    // Load the tree image
    this.image = new Image();
    this.image.src = 'https://file.garden/Zy7B0LkdIVpGyzA1/maple_tree.png';
  }

  renderCanopy(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    
    // Draw shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 40, 40, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw the tree image
    if (this.image.complete) {
      ctx.drawImage(this.image, -50, -80, 100, 100); // Adjust size and position as needed
    }
    
    ctx.restore();
  }

  getTooltipContent() {
    const baseContent = super.getTooltipContent();
    return {
      ...baseContent,
      extraInfo: 'Maple Tree'
    };
  }
}