export class GatherOre {
  constructor(x, y, type, options = {}) {
    this.x = x;
    this.y = y;
    this.width = options.width || 50;
    this.height = options.height || 50;
    this.maxHealth = options.health || 5;
    this.health = this.maxHealth;
    this.interactable = true;
    this.progress = 0;
    this.miningPhase = 0;
    this.type = type;
    this.harvestCount = options.harvestCount || 1;
    this.baseColor = options.baseColor || '#808080';
    this.sparkColor = options.sparkColor || '#a0a0a0';
    this.miningDifficulty = options.miningDifficulty || 1;
  }

  checkClick(worldX, worldY) {
    return worldX > this.x - this.width/2 && 
           worldX < this.x + this.width/2 &&
           worldY > this.y - this.height/2 && 
           worldY < this.y + this.height/2;
  }

  startMining() {
    if (this.progress < 100) {
      // Adjust progress based on mining difficulty
      const progressIncrement = 20 / this.miningDifficulty;
      this.progress += progressIncrement;
      this.miningPhase = performance.now();
      return this.progress >= 100;
    }
    return false;
  }

  getHarvestItems() {
    if (this.progress >= 100) {
      return Array(this.harvestCount).fill({
        type: this.type,
        quantity: 1
      });
    }
    return [];
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Ore body
    ctx.fillStyle = this.baseColor;
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();

    // Ore veins/details
    ctx.strokeStyle = this.sparkColor;
    ctx.lineWidth = 3;
    ctx.beginPath();
    [-Math.PI/4, 0, Math.PI/4].forEach(angle => {
      ctx.moveTo(15 * Math.cos(angle), 15 * Math.sin(angle));
      ctx.lineTo(25 * Math.cos(angle), 25 * Math.sin(angle));
    });
    ctx.stroke();

    // Mining progress bar
    if (this.progress > 0) {
      const barWidth = 60;
      const barHeight = 8;
      
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      ctx.fillRect(-barWidth/2, -40, barWidth, barHeight);
      
      ctx.fillStyle = this.sparkColor;
      ctx.fillRect(-barWidth/2, -40, (barWidth * this.progress)/100, barHeight);
      
      // Sparkle effect when nearly mined
      if (this.progress >= 75) {
        ctx.fillStyle = `hsla(50, 100%, 70%, ${Math.random()})`;
        ctx.beginPath();
        ctx.arc(
          -barWidth/2 + (barWidth * this.progress/100) - 4,
          -40,
          2 + Math.random()*3,
          0, Math.PI*2
        );
        ctx.fill();
      }
    }

    ctx.restore();
  }

  getTooltipContent() {
    return {
      icon: `<svg viewBox="0 0 32 32" width="24" height="24">
        <path fill="${this.baseColor}" d="M16 4l12 7v10H4V11l12-7z"/>
        <path fill="${this.sparkColor}" d="M8 8h4v4H8zm8 8h4v4h-4zm4-8h4v4h-4z"/>
      </svg>`,
      title: `${this.type.charAt(0).toUpperCase() + this.type.slice(1)} Ore`,
      type: 'Mineral',
      health: this.health,
      description: this.description || 'A mineable ore deposit',
      extraInfo: `Mining Level: ${this.miningDifficulty}`
    };
  }

  createMiningParticles(x, y) {
    const particles = [];
    for (let i = 0; i < 5; i++) {
      particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y + (Math.random() - 0.5) * 20,
        size: Math.random() * 4 + 2,
        color: this.sparkColor,
        lifetime: 1000,
        velocity: {
          x: (Math.random() - 0.5) * 100,
          y: (Math.random() - 0.5) * 100 - 50
        }
      });
    }
    return particles;
  }
}