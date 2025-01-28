import { GatherTree } from './gather_tree.js';

export class DeadTree extends GatherTree {
  constructor(x, y) {
    const options = {
      width: 50,
      height: 100,
      health: 5,
      harvestCount: 2,
      baseColor: '#4a4a4a',
      swingSpeed: 0.3,
      trunkTexture: true,
      darkBaseColor: '#333333'
    };
    
    super(x, y, 'dead', options);
    
    this.treeType = 'Decayed';
    this.description = 'Brittle dry wood';
    this.swingPhase = Math.random() * Math.PI * 2;
    this.options = options; // Store options for later use
  }

  update(deltaTime) {
    this.swingPhase += deltaTime * this.options.swingSpeed;
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    
    // Trunk with cracks
    ctx.fillStyle = this.options.baseColor;
    ctx.fillRect(-8, -80, 16, 80);
    
    // Cracks/damage
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    [0.2, 0.5, 0.8].forEach(h => {
      ctx.beginPath();
      ctx.moveTo(-8, -80 * h);
      ctx.lineTo(2, -80 * h - 10);
      ctx.lineTo(-4, -80 * h - 15);
      ctx.stroke();
    });
    
    // Dead branches with sway animation
    const sway = Math.sin(this.swingPhase) * 2;
    [-Math.PI/4, 0, Math.PI/4].forEach(angle => {
      ctx.save();
      ctx.translate(0, -40);
      ctx.rotate(angle + sway/10);
      ctx.fillStyle = '#555';
      ctx.fillRect(0, 0, 30, 4);
      ctx.restore();
    });

    ctx.restore();
  }

  getTooltipContent() {
    return {
      icon: `<svg viewBox="0 0 32 32" width="24" height="24">
        <path fill="#4a4a4a" d="M16 2l14 12v16H2V14L16 2zm4 24h-8v-6h8v6z"/>
      </svg>`,
      title: 'Dead Tree',
      type: this.treeType,
      health: this.health,
      description: this.description,
      extraInfo: 'Harvests: 2x wood'
    };
  }
}