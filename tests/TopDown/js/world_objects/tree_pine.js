import { GatherTree } from './gather_tree.js';

export class PineTree extends GatherTree {
  constructor(x, y) {
    super(x, y, 'pine', {
      width: 80,
      height: 140,
      health: 8,
      harvestCount: 2,
      baseColor: '#5C4033',
      leafColor: '#2d5a27'
    });
    this.treeType = 'Coniferous';
    this.description = 'Produces pine resin';
  }

  renderCanopy(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    
    // Ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 35, 35, 0, 0, Math.PI * 2);
    ctx.fill();

    // Trunk
    ctx.fillStyle = this.baseColor;
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(-8, -50);
    ctx.lineTo(8, -50);
    ctx.lineTo(10, 0);
    ctx.fill();

    // Bark detail
    ctx.strokeStyle = this.adjustColor(this.baseColor, -20);
    ctx.lineWidth = 1;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-8 + i * 6, 0);
      ctx.lineTo(-6 + i * 6, -45);
      ctx.stroke();
    }

    // Pine tree layers from bottom to top
    const layers = [
      { y: -45, size: 45, color: '#2d5a27' },  // Bottom
      { y: -65, size: 40, color: '#25502f' },  // Lower middle
      { y: -85, size: 35, color: '#1e4628' },  // Upper middle
      { y: -105, size: 25, color: '#183b20' }  // Top
    ];

    // Draw each layer with detail
    layers.forEach((layer, index) => {
      // Shadow/underside
      ctx.fillStyle = this.adjustColor(layer.color, -20);
      this.drawPineLayer(ctx, layer.y + 3, layer.size);

      // Main color
      ctx.fillStyle = layer.color;
      this.drawPineLayer(ctx, layer.y, layer.size);

      // Highlight
      ctx.fillStyle = this.adjustColor(layer.color, 20);
      this.drawPineLayer(ctx, layer.y - 3, layer.size * 0.8);

      // Needle detail
      ctx.strokeStyle = this.adjustColor(layer.color, -30);
      ctx.lineWidth = 1;
      const detail = 5 - index; // More detail on lower layers
      for (let i = 0; i < detail; i++) {
        const angle = (Math.PI * 2 * i) / detail;
        const x = Math.cos(angle) * layer.size * 0.5;
        const y = layer.y;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle + Math.PI/4) * 10, 
                  y + Math.sin(angle + Math.PI/4) * 10);
        ctx.stroke();
      }
    });

    ctx.restore();
  }

  drawPineLayer(ctx, y, size) {
    ctx.beginPath();
    // Create a more natural pine shape with slight irregularities
    ctx.moveTo(-size * 0.9, y);
    ctx.quadraticCurveTo(-size * 0.5, y - size * 0.3, 0, y - size * 0.6);
    ctx.quadraticCurveTo(size * 0.5, y - size * 0.3, size * 0.9, y);
    ctx.quadraticCurveTo(size * 0.3, y + size * 0.2, 0, y + size * 0.3);
    ctx.quadraticCurveTo(-size * 0.3, y + size * 0.2, -size * 0.9, y);
    ctx.closePath();
    ctx.fill();
  }

  adjustColor(color, amount) {
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.substr(0,2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.substr(2,2), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.substr(4,2), 16) + amount));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
}