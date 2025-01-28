import { GatherTree } from './gather_tree.js';

export class MapleTree extends GatherTree {
  constructor(x, y) {
    super(x, y, 'maple', {
      width: 90,
      height: 90,
      health: 8,
      baseColor: '#8B4513',
      leafColor: '#d79b70'
    });
    this.treeType = 'Deciduous';
    this.description = 'Seasonal syrup source';
    
    // Vibrant seasonal colors
    const seasons = [
      { color: '#4CAF50', shadow: '#388E3C', highlight: '#81C784' },  // Spring
      { color: '#2E7D32', shadow: '#1B5E20', highlight: '#43A047' },  // Summer
      { color: '#FF5722', shadow: '#D84315', highlight: '#FF7043' },  // Fall
      { color: '#795548', shadow: '#5D4037', highlight: '#8D6E63' }   // Winter
    ];
    this.season = seasons[Math.floor(Math.random() * seasons.length)];
  }

  renderCanopy(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    
    // Large ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.25)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 40, 40, 0, 0, Math.PI * 2);
    ctx.fill();

    // Thick trunk with detail
    ctx.fillStyle = this.baseColor;
    ctx.beginPath();
    ctx.moveTo(-12, 0);
    ctx.lineTo(-10, -35);
    ctx.lineTo(-8, -45);
    ctx.lineTo(8, -45);
    ctx.lineTo(10, -35);
    ctx.lineTo(12, 0);
    ctx.fill();
    
    // Trunk detail
    ctx.strokeStyle = this.adjustColor(this.baseColor, -20);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-8, -5);
    ctx.lineTo(-6, -40);
    ctx.moveTo(8, -5);
    ctx.lineTo(6, -40);
    ctx.stroke();

    // Main foliage structure - 5 overlapping circles for fuller appearance
    const positions = [
      { x: -20, y: -55, size: 25 },  // Left
      { x: 20, y: -55, size: 25 },   // Right
      { x: -10, y: -65, size: 25 },  // Upper left
      { x: 10, y: -65, size: 25 },   // Upper right
      { x: 0, y: -60, size: 35 }     // Center
    ];

    // Draw shadows first
    positions.forEach(pos => {
      ctx.fillStyle = this.season.shadow;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, pos.size, 0, Math.PI * 2);
      ctx.fill();
    });

    // Main color layer
    positions.forEach(pos => {
      ctx.fillStyle = this.season.color;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y - 3, pos.size - 2, 0, Math.PI * 2);
      ctx.fill();
    });

    // Highlights for depth
    positions.forEach(pos => {
      ctx.fillStyle = this.season.highlight;
      ctx.beginPath();
      ctx.arc(pos.x + 5, pos.y - 8, pos.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
    });

    // Add characteristic maple leaf pattern suggestion
    ctx.strokeStyle = this.season.shadow;
    ctx.lineWidth = 1;
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const x = Math.cos(angle) * 15;
      const y = Math.sin(angle) * 15 - 40;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(angle + Math.PI/2) * 10, y + Math.sin(angle + Math.PI/2) * 10);
      ctx.stroke();
    }

    ctx.restore();
  }

  adjustColor(color, amount) {
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.substr(0,2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.substr(2,2), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.substr(4,2), 16) + amount));
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  getTooltipContent() {
    const baseContent = super.getTooltipContent();
    const seasonNames = ['Spring', 'Summer', 'Fall', 'Winter'];
    const currentSeason = seasonNames[this.season.color === '#4CAF50' ? 0 : this.season.color === '#2E7D32' ? 1 : this.season.color === '#FF5722' ? 2 : 3];
    return {
      ...baseContent,
      extraInfo: `${currentSeason} Maple Tree`
    };
  }
}