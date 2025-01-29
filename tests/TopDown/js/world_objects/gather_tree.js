import { CollisionSystem } from '../collision.js';

export class GatherTree {
  constructor(x, y, type, options = {}) {
    this.x = x;
    this.y = y;
    this.width = options.width || 50;
    this.height = options.height || 100;
    this.maxHealth = options.health || 8;
    this.health = this.maxHealth;
    this.interactable = true;
    this.collidable = true;
    this.type = type;
    this.harvestCount = options.harvestCount || 1;
    this.baseColor = options.baseColor || '#8B4513';
    this.leafColor = options.leafColor || '#2d5a27';
  }

  checkClick(worldX, worldY) {
    return worldX > this.x - this.width/2 && 
           worldX < this.x + this.width/2 &&
           worldY > this.y - this.height/2 && 
           worldY < this.y + this.height/2;
  }

  startGathering() {
    if (this.health > 0) {
      this.health--;
      // Returns true if completely harvested
      return this.health <= 0;
    }
    return false;
  }

  getHarvestItems() {
    if (this.health <= 0) {
      return Array(this.harvestCount).fill({
        type: 'wood',
        quantity: 1
      });
    }
    return [];
  }

  renderTrunk(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Base trunk
    ctx.fillStyle = this.baseColor;
    ctx.fillRect(-8, -80, 16, 80);
    
    // Optional trunk texture
    if (this.trunkTexture) {
      ctx.strokeStyle = this.darkBaseColor || '#5C4033';
      ctx.lineWidth = 2;
      for (let i = 0; i < 4; i++) {
        const y = -70 + i * 20;
        ctx.beginPath();
        ctx.moveTo(-8, y);
        ctx.quadraticCurveTo(0, y + 5, 8, y);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  renderCanopy(ctx) {
    // To be implemented by specific tree types
  }

  render(ctx) {
    this.renderTrunk(ctx);
    this.renderCanopy(ctx);
  }

  getTooltipContent() {
    return {
      icon: `<svg viewBox="0 0 32 32" width="24" height="24">
        <path fill="${this.leafColor}" d="M16 2L2 16h28L16 2zm0 4l10 10H6L16 6z"/>
      </svg>`,
      title: `${this.type.charAt(0).toUpperCase() + this.type.slice(1)} Tree`,
      type: this.treeType || 'Tree',
      health: this.health,
      description: this.description || 'A gatherable tree'
    };
  }

  checkCollision(px, py, pWidth, pHeight) {
    return CollisionSystem.checkRectangleCollision(
      px, py, pWidth, pHeight,
      this.x - this.width / 2, this.y - this.height / 2,
      this.width, this.height
    );
  }
}