import { GatherTree } from './gather_tree.js';

export class FirTree extends GatherTree {
  constructor(x, y) {
    super(x, y, 'fir', {
      width: 50,
      height: 140,
      health: 10,
      baseColor: '#4a2b0f',
      leafColor: '#245c2c'
    });
    this.treeType = 'Evergreen';
    this.description = 'Source of sturdy timber';
  }

  renderCanopy(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    
    // Branch layers with conical shape
    const layers = [
      { y: -20, height: 40, color: '#245c2c' },
      { y: -40, height: 35, color: '#1a4d23' }, 
      { y: -65, height: 30, color: '#123d1a' },
      { y: -90, height: 25, color: '#0a2d11' }
    ];
    
    layers.forEach(layer => {
      ctx.fillStyle = layer.color;
      ctx.beginPath();
      ctx.moveTo(-25, layer.y);
      ctx.lineTo(25, layer.y);
      ctx.lineTo(0, layer.y - layer.height);
      ctx.closePath();
      ctx.fill();
    });

    // Animation sway
    ctx.translate(Math.sin(this.swingPhase) * 4, 0);
    
    ctx.restore();
  }
}