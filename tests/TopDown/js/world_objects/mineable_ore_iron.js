import { GatherOre } from './gather_ore.js';

export class IronOre extends GatherOre {
  constructor(x, y) {
    super(x, y, 'iron', {
      width: 45,
      height: 45,
      health: 5,
      baseColor: '#8b4513',
      sparkColor: '#cd5c5c',
      miningDifficulty: 2,
      description: 'Dense iron ore\nRequires stronger tools to process',
      spawnRate: 0.8
    });

    // Generate main ore shape points
    this.points = [
      { x: -20, y: -5 },
      { x: -15, y: -15 },
      { x: -5, y: -20 },
      { x: 5, y: -18 },
      { x: 15, y: -10 },
      { x: 18, y: 0 },
      { x: 15, y: 10 },
      { x: 5, y: 15 },
      { x: -5, y: 12 },
      { x: -15, y: 5 }
    ];
    
    // Generate iron vein points
    this.veins = [
      { start: { x: -10, y: -5 }, cp: { x: -5, y: 0 }, end: { x: 5, y: 5 } },
      { start: { x: 5, y: -10 }, cp: { x: 0, y: -5 }, end: { x: -5, y: 0 } },
      { start: { x: -8, y: 8 }, cp: { x: 0, y: 5 }, end: { x: 8, y: 2 } }
    ];
  }

  quadraticPoint(p0, p1, p2, t) {
    return (1 - t) * (1 - t) * p0 + 2 * (1 - t) * t * p1 + t * t * p2;
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Draw shadow
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.ellipse(3, 3, 20, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Draw main ore shape
    ctx.beginPath();
    ctx.moveTo(this.points[0].x, this.points[0].y);
    for (let i = 1; i < this.points.length; i++) {
      ctx.lineTo(this.points[i].x, this.points[i].y);
    }
    ctx.closePath();

    // Create iron gradient with rusty colors
    const baseGradient = ctx.createRadialGradient(-5, -5, 0, 0, 0, 25);
    baseGradient.addColorStop(0, '#8b4513');    // Rusty brown
    baseGradient.addColorStop(0.4, '#a0522d');  // Medium rust
    baseGradient.addColorStop(1, '#800000');    // Dark maroon
    
    ctx.fillStyle = baseGradient;
    ctx.fill();
    
    // Draw iron veins
    this.veins.forEach(vein => {
      // Main vein
      ctx.beginPath();
      ctx.moveTo(vein.start.x, vein.start.y);
      ctx.quadraticCurveTo(vein.cp.x, vein.cp.y, vein.end.x, vein.end.y);
      ctx.strokeStyle = '#cd5c5c';  // Indian red for veins
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Metallic highlights along veins
      ctx.lineWidth = 1;
      for (let i = 0; i < 2; i++) {
        const t = 0.3 + i * 0.4;
        const px = this.quadraticPoint(vein.start.x, vein.cp.x, vein.end.x, t);
        const py = this.quadraticPoint(vein.start.y, vein.cp.y, vein.end.y, t);
        
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(
          px + (Math.random() - 0.5) * 8,
          py + (Math.random() - 0.5) * 8
        );
        ctx.strokeStyle = '#bc8f8f';  // Rosy brown for smaller veins
        ctx.stroke();
      }
    });

    // Add iron flecks (oxidized spots)
    for (let i = 0; i < 12; i++) {
      ctx.beginPath();
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.random() * 15;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = Math.random() > 0.5 ? '#b22222' : '#8b0000';  // Fire brick/Dark red flecks
      ctx.fill();
    }

    // Add metallic highlights
    ctx.fillStyle = 'rgba(255,255,255,0.15)';  // Subtle highlight for iron
    ctx.beginPath();
    ctx.ellipse(-8, -8, 6, 4, Math.PI/4, 0, Math.PI * 2);
    ctx.fill();

    // Add outline
    ctx.strokeStyle = '#4a0000';  // Very dark red outline
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Mining progress bar
    if (this.progress > 0) {
      const barWidth = 40;
      const barHeight = 8;
      
      // Progress bar background
      ctx.fillStyle = 'rgba(0,0,0,0.8)';
      ctx.fillRect(-barWidth/2, -35, barWidth, barHeight);
      
      // Progress bar border
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.strokeRect(-barWidth/2, -35, barWidth, barHeight);
      
      // Progress fill with iron gradient
      const progressGradient = ctx.createLinearGradient(-barWidth/2, 0, barWidth/2, 0);
      progressGradient.addColorStop(0, '#8b4513');  // Rusty brown
      progressGradient.addColorStop(1, '#800000');  // Dark maroon
      ctx.fillStyle = progressGradient;
      ctx.fillRect(-barWidth/2, -35, (barWidth * this.progress)/100, barHeight);
      
      // Mining sparkle effect
      if (this.progress >= 75) {
        const sparkleOpacity = 0.5 + Math.sin(performance.now() / 200) * 0.5;
        const sparkleSize = 2 + Math.sin(performance.now() / 150);
        
        ctx.fillStyle = `hsla(0, 100%, 70%, ${sparkleOpacity})`;  // Red sparkles
        ctx.beginPath();
        ctx.arc(
          -barWidth/2 + (barWidth * this.progress/100) - 4,
          -35 + barHeight/2,
          sparkleSize,
          0, Math.PI*2
        );
        ctx.fill();
      }
    }

    ctx.restore();
  }
}