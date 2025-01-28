import { GatherTree } from './gather_tree.js';

export class DeadTree extends GatherTree {
  constructor(x, y) {
    const options = {
      width: 90,
      height: 100,
      health: 5,
      harvestCount: 2,
      baseColor: '#4a4a4a',
      darkBaseColor: '#2a2a2a',
      crackColor: '#1a1a1a',
      barkHighlight: '#606060',
      rotColor: '#3d3d3d'
    };
    
    super(x, y, 'dead', options);
    
    this.treeType = 'Decayed';
    this.description = 'Ancient dead wood';
    this.options = options;
    
    // Generate unique pattern for this tree once at creation
    this.pattern = {
      crackOffset: Math.random() * Math.PI,
      branchPattern: Math.floor(Math.random() * 3),
      trunkTwist: (Math.random() - 0.5) * 0.2,
      // Pre-calculate all random values needed for rendering
      crackPatterns: this.generateCrackPatterns(),
      branchDetails: this.generateBranchDetails()
    };
  }

  generateCrackPatterns() {
    const patterns = [];
    // Pre-generate all crack variations
    for (let i = 0; i < 5; i++) {
      const segments = [];
      for (let j = 0; j < 8; j++) {
        segments.push({
          angle: (Math.random() - 0.5) * 0.8,
          length: 0.5 + Math.random() * 0.5,
          hasBranch: Math.random() < 0.7,
          branchAngle: (Math.random() - 0.5) * Math.PI
        });
      }
      patterns.push(segments);
    }
    return patterns;
  }

  generateBranchDetails() {
    const details = [];
    // Pre-generate branch textures
    for (let i = 0; i < 10; i++) {
      details.push({
        variance: Math.random() * 0.5,
        offset: Math.random() * 2
      });
    }
    return details;
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    
    // Enhanced ground shadow with decay spread
    const shadowGradient = ctx.createRadialGradient(0, 0, 5, 0, 0, 40);
    shadowGradient.addColorStop(0, 'rgba(0, 0, 0, 0.25)');
    shadowGradient.addColorStop(0.6, 'rgba(0, 0, 0, 0.15)');
    shadowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = shadowGradient;
    ctx.beginPath();
    ctx.ellipse(0, 0, 40, 40, 0, 0, Math.PI * 2);
    ctx.fill();
    
    this.renderTrunk(ctx);
    this.renderCracks(ctx);
    this.renderBranches(ctx);
    this.renderDecayDetails(ctx);
    
    ctx.restore();
  }

  renderTrunk(ctx) {
    ctx.fillStyle = this.options.baseColor;
    ctx.beginPath();
    ctx.moveTo(-15, 0);
    
    const twist = this.pattern.trunkTwist;
    const cp1x = -13 + twist * 30;
    const cp2x = -10 - twist * 30;
    
    ctx.bezierCurveTo(
      cp1x, -20,
      cp2x, -40,
      -12, -70
    );
    ctx.lineTo(12, -70);
    ctx.bezierCurveTo(
      10 - twist * 30, -40,
      13 + twist * 30, -20,
      15, 0
    );
    ctx.fill();
    
    // Bark texture
    ctx.strokeStyle = this.options.darkBaseColor;
    ctx.lineWidth = 1;
    
    // Static grain lines
    for (let i = -12; i <= 12; i += 3) {
      const offset = Math.sin(i * 0.2 + this.pattern.crackOffset) * 5;
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.bezierCurveTo(
        i + twist * 20, -25 + offset,
        i - twist * 20, -50 + offset,
        i * 0.8, -70
      );
      ctx.stroke();
    }
    
    // Age rings
    for (let y = -10; y >= -65; y -= 15) {
      ctx.beginPath();
      const width = Math.abs(y) * 0.2 + 5;
      ctx.ellipse(0, y, width, 3, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  renderCracks(ctx) {
    ctx.strokeStyle = this.options.crackColor;
    ctx.lineWidth = 2;
    
    const crackPositions = [
      { y: -15, length: 25, patternIndex: 0 },
      { y: -35, length: 30, patternIndex: 1 },
      { y: -55, length: 20, patternIndex: 2 }
    ];
    
    crackPositions.forEach(crack => {
      this.renderComplexCrack(ctx, crack.y, crack.length, crack.patternIndex);
    });
  }

  renderComplexCrack(ctx, startY, length, patternIndex) {
    const startX = ((patternIndex % 3) - 1) * 5;
    const pattern = this.pattern.crackPatterns[patternIndex];
    
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    
    let x = startX;
    let y = startY;
    
    pattern.forEach(segment => {
      const segLength = length * 0.25;
      const newX = x + Math.cos(segment.angle) * segLength;
      const newY = y - segLength;
      
      ctx.lineTo(newX, newY);
      
      if (segment.hasBranch) {
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(newX, newY);
        const branchLength = segLength * segment.length;
        ctx.lineTo(
          newX + Math.cos(segment.branchAngle) * branchLength,
          newY + Math.sin(segment.branchAngle) * branchLength
        );
        ctx.stroke();
        ctx.restore();
      }
      
      x = newX;
      y = newY;
    });
    
    ctx.stroke();
  }

  renderBranches(ctx) {
    const branchSets = [
      [
        { angle: -Math.PI/3, length: 35, width: 5, y: -60 },
        { angle: Math.PI/3.5, length: 30, width: 4, y: -45 },
        { angle: -Math.PI/4, length: 25, width: 4, y: -30 }
      ],
      [
        { angle: Math.PI/3, length: 35, width: 5, y: -55 },
        { angle: -Math.PI/3.5, length: 30, width: 4, y: -40 },
        { angle: Math.PI/4, length: 25, width: 4, y: -25 }
      ],
      [
        { angle: -Math.PI/4, length: 40, width: 5, y: -50 },
        { angle: Math.PI/4, length: 40, width: 5, y: -35 },
        { angle: 0, length: 25, width: 4, y: -20 }
      ]
    ][this.pattern.branchPattern];

    branchSets.forEach((branch, index) => {
      ctx.fillStyle = this.options.darkBaseColor;
      ctx.save();
      ctx.translate(0, branch.y);
      ctx.rotate(branch.angle);
      
      ctx.beginPath();
      ctx.moveTo(0, -branch.width/2);
      ctx.lineTo(branch.length, -branch.width/4);
      ctx.lineTo(branch.length, branch.width/4);
      ctx.lineTo(0, branch.width/2);
      ctx.fill();
      
      // Static wood texture
      ctx.strokeStyle = this.options.crackColor;
      ctx.lineWidth = 0.5;
      
      const branchDetail = this.pattern.branchDetails[index];
      for (let i = 5; i < branch.length - 5; i += 4) {
        ctx.beginPath();
        ctx.moveTo(i, -branch.width/4 + branchDetail.variance * branch.width);
        ctx.lineTo(i + 3 + branchDetail.offset, 0);
        ctx.stroke();
      }
      
      if (branch.length > 20) {
        ctx.beginPath();
        ctx.moveTo(branch.length - 10, 0);
        ctx.lineTo(branch.length + 5, branch.width/3);
        ctx.moveTo(branch.length - 10, 0);
        ctx.lineTo(branch.length + 5, -branch.width/3);
        ctx.stroke();
      }
      
      ctx.restore();
    });
  }

  renderDecayDetails(ctx) {
    const spots = [
      { x: -8, y: -20, size: 6 },
      { x: 5, y: -40, size: 8 },
      { x: -6, y: -55, size: 5 }
    ];
    
    spots.forEach((spot, index) => {
      const gradient = ctx.createRadialGradient(
        spot.x, spot.y, 0,
        spot.x, spot.y, spot.size
      );
      gradient.addColorStop(0, this.options.rotColor);
      gradient.addColorStop(0.6, this.options.darkBaseColor);
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(spot.x, spot.y, spot.size, 0, Math.PI * 2);
      ctx.fill();
      
      // Static decay texture
      ctx.strokeStyle = this.options.crackColor;
      ctx.lineWidth = 0.5;
      const pattern = this.pattern.crackPatterns[index];
      for (let i = 0; i < 4; i++) {
        const segment = pattern[i];
        const angle = (Math.PI * 2 * i / 4) + segment.angle;
        ctx.beginPath();
        ctx.moveTo(spot.x, spot.y);
        ctx.lineTo(
          spot.x + Math.cos(angle) * spot.size,
          spot.y + Math.sin(angle) * spot.size
        );
        ctx.stroke();
      }
    });
  }

  getTooltipContent() {
    return {
      icon: `<svg viewBox="0 0 32 32" width="24" height="24">
        <path fill="#4a4a4a" d="M16 2l14 12v16H2V14L16 2zm4 24h-8v-6h8v6z"/>
      </svg>`,
      title: 'Ancient Dead Tree',
      type: this.treeType,
      health: this.health,
      description: this.description,
      extraInfo: 'Harvests: 2x aged wood'
    };
  }
}