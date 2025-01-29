import { GatherTree } from './gather_tree.js';
import { TextureCache } from '../utils/texture_cache.js';

export class FirTree extends GatherTree {
  static TEXTURE_URL = 'https://file.garden/Zy7B0LkdIVpGyzA1/fir_tree.png';
  
  constructor(x, y) {
    super(x, y - 25, 'fir', {
      width: 45,
      height: 50,
      health: 12,
      baseColor: '#3E2723',
      leafColor: '#1B5E20'
    });
    this.treeType = 'Coniferous';
    this.description = 'Tall fir tree';
    this.collidable = true;

    // Initialize texture
    this.textureLoaded = false;
    this.initTexture();
  }

  async initTexture() {
    try {
      const textureCache = TextureCache.getInstance();
      this.foliageTexture = await textureCache.loadTexture(FirTree.TEXTURE_URL);
      this.textureLoaded = true;
    } catch (err) {
      console.error('Failed to load fir tree texture. Using fallback rendering.');
      this.textureLoaded = false;
    }
  }

  render(ctx) {
    if (this.textureLoaded && this.foliageTexture) {
      this.renderCanopy(ctx);
    } else {
      this.renderTrunk(ctx);
      this.renderCanopy(ctx);
    }
  }

  renderCanopy(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    
    if (this.textureLoaded && this.foliageTexture) {
      // Use the loaded texture for the entire tree
      const width = 60;
      const height = 120;
      ctx.drawImage(this.foliageTexture, -width/2, -height + 10, width, height);
    } else {
      // Fallback rendering if texture fails to load
      ctx.fillStyle = this.leafColor;
      // Draw a simple triangle for the fir tree
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