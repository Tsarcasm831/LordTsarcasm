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
    
    // Pre-calculate branch angles for performance
    this.branchAngles = [];
    const branchCount = 5;
    for (let i = 0; i < branchCount; i++) {
      this.branchAngles.push(Math.PI * 0.1 + (Math.PI * 0.8 * i / (branchCount - 1)));
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

    // Main layers of the tree (from bottom to top)
    const layers = [
      { y: -15, width: 60, color: '#2d693a' },
      { y: -45, width: 55, color: '#286334' },
      { y: -75, width: 50, color: '#245c2e' },
      { y: -105, width: 40, color: '#1f5529' },
      { y: -135, width: 30, color: '#1a4d23' }
    ];

    // Render each layer with detail
    layers.forEach((layer, index) => {
      const height = 35;
      
      // Main triangular shape
      ctx.fillStyle = layer.color;
      ctx.beginPath();
      ctx.moveTo(-layer.width/2, layer.y);
      ctx.lineTo(layer.width/2, layer.y);
      ctx.lineTo(0, layer.y - height);
      ctx.closePath();
      ctx.fill();

      // Add darker edges for depth
      ctx.strokeStyle = this.adjustColor(layer.color, -20);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(-layer.width/2, layer.y);
      ctx.lineTo(0, layer.y - height);
      ctx.lineTo(layer.width/2, layer.y);
      ctx.stroke();

      // Add branch details
      if (index < layers.length - 1) {
        ctx.strokeStyle = this.adjustColor(layer.color, -10);
        ctx.lineWidth = 1;
        this.branchAngles.forEach(angle => {
          const length = layer.width * 0.4;
          ctx.beginPath();
          ctx.moveTo(0, layer.y - height/2);
          ctx.lineTo(
            Math.cos(angle) * length,
            layer.y - height/2 + Math.sin(angle) * length
          );
          ctx.stroke();
        });
      }

      // Add highlight spots for dimension
      ctx.fillStyle = this.adjustColor(layer.color, 15);
      const spotCount = 3;
      for(let i = 0; i < spotCount; i++) {
        const x = (i - 1) * layer.width/4;
        const y = layer.y - height/3;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    ctx.restore();
  }

  // Utility function to adjust color brightness
  adjustColor(color, amount) {
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.substr(0,2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.substr(2,2), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.substr(4,2), 16) + amount));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
}