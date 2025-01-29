import { GatherTree } from './gather_tree.js';
import { TextureCache } from '../utils/texture_cache.js';

export class PineTree extends GatherTree {
  static TEXTURE_URL = 'https://file.garden/Zy7B0LkdIVpGyzA1/pine_tree.png';
  
  constructor(x, y) {
    super(x, y - 25, 'pine', {
      width: 45,
      height: 50,
      health: 12,
      baseColor: '#3E2723',
      leafColor: '#1B5E20'
    });
    this.treeType = 'Coniferous';
    this.description = 'Tall pine tree';
    this.collidable = true;

    // Initialize texture
    this.textureLoaded = false;
    this.initTexture();
  }

  async initTexture() {
    try {
      const textureCache = TextureCache.getInstance();
      this.foliageTexture = await textureCache.loadTexture(PineTree.TEXTURE_URL);
      this.textureLoaded = true;
    } catch (err) {
      console.error('Failed to load pine tree texture. Using fallback rendering.');
      this.textureLoaded = false;
    }
  }

  render(ctx) {
    if (this.textureLoaded && this.foliageTexture) {
      this.renderCanopy(ctx);
    } else {
      // Only draw trunk for fallback rendering
      this.renderTrunk(ctx);
      this.renderCanopy(ctx);
    }
  }

  renderCanopy(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    
    // Ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 25, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    if (this.textureLoaded && this.foliageTexture) {
      // Use the loaded texture for the entire tree
      const width = 60;
      const height = 120;
      ctx.drawImage(this.foliageTexture, -width/2, -height + 10, width, height);
    } else {
      // Fallback rendering if texture fails to load
      ctx.fillStyle = this.leafColor;
      // Draw a simple triangle for the pine tree
      ctx.beginPath();
      ctx.moveTo(-30, -15);
      ctx.lineTo(0, -135);
      ctx.lineTo(30, -15);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }
}