import { GatherTree } from './gather_tree.js';

export class FirTree extends GatherTree {
  constructor(x, y) {
    super(x, y, 'fir', {
      width: 65,
      height: 170,
      health: 10,
      baseColor: '#3d2208',
      leafColor: '#2d693a'
    });
    this.treeType = 'Evergreen';
    this.description = 'Source of sturdy timber';
    
    // Load the foliage texture
    this.foliageTexture = new Image();
    this.foliageTexture.crossOrigin = "anonymous"; // Add CORS header
    this.foliageTexture.onload = () => {
      console.log('Fir tree texture loaded successfully');
    };
    this.foliageTexture.onerror = (err) => {
      console.error('Failed to load fir tree texture:', err);
    };
    this.foliageTexture.src = 'https://file.garden/Zy7B0LkdIVpGyzA1/fir_needles.webp';
  }

  renderCanopy(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    
    // Ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 25, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw the foliage texture if loaded
    if (this.foliageTexture.complete) {
      // console.log('Drawing fir tree texture');
      const width = 60;
      const height = 120;
      ctx.drawImage(this.foliageTexture, -width/2, -height - 15, width, height);
    } else {
      console.log('Fir tree texture not yet loaded');
      // Fallback to a simple green triangle if image isn't loaded
      ctx.fillStyle = '#2d693a';
      ctx.beginPath();
      ctx.moveTo(-30, -15);
      ctx.lineTo(30, -15);
      ctx.lineTo(0, -135);
      ctx.closePath();
      ctx.fill();
    }

    ctx.restore();
  }
}