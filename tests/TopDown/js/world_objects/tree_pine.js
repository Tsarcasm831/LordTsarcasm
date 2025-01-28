import { GatherTree } from './gather_tree.js';

export class PineTree extends GatherTree {
  constructor(x, y) {
    super(x, y, 'pine', {
      width: 60,
      height: 120,
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
    
    const sway = Math.sin(this.swingPhase) * 3;
    const layers = [
      { y: -80, scale: 1.2, color: '#4d9a47' },
      { y: -140, scale: 1.0, color: '#3d7a37' },
      { y: -180, scale: 0.8, color: '#2d5a27' }
    ];
    
    layers.forEach(layer => {
      ctx.save();
      ctx.translate(sway * layer.scale, 0);
      ctx.fillStyle = layer.color;
      
      ctx.beginPath();
      ctx.moveTo(-40 * layer.scale, layer.y);
      ctx.lineTo(40 * layer.scale, layer.y);
      ctx.lineTo(0, layer.y - 60 * layer.scale);
      ctx.closePath();
      ctx.fill();
      
      ctx.restore();
    });

    ctx.restore();
  }
}