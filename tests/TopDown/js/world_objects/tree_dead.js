import { GatherTree } from './gather_tree.js';

export class DeadTree extends GatherTree {
  constructor(x, y) {
    super(x + 35, y + 50, 'dead', {
      width: 70,
      height: 100,
      health: 5,
      baseColor: '#4E342E',
      leafColor: '#795548'
    });
    this.treeType = 'Dead';
    this.description = 'Withered and dry';
    this.collidable = true;
    this.tooltipContent = {
      title: 'Dead Tree',
      type: 'Tree',
      description: 'A withered tree\nCan be chopped for wood'
    };
    
    // Load the tree image
    this.image = new Image();
    this.image.src = 'https://file.garden/Zy7B0LkdIVpGyzA1/dead_tree.png';
  }

  update(deltaTime) {
    // Dead trees don't move
  }

  render(ctx) {
    ctx.save();
    
    // Draw the tree image centered at x,y
    ctx.drawImage(
      this.image, 
      this.x - this.width/2, 
      this.y - this.height/2,
      this.width,
      this.height
    );
    
    // Base shadow
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + 10, 20, 8, 0, 0, Math.PI*2);
    ctx.fill();

    ctx.restore();
  }

  checkClick(worldX, worldY) {
    return worldX > this.x - this.width/2 && 
           worldX < this.x + this.width/2 &&
           worldY > this.y - this.height/2 && 
           worldY < this.y + this.height/2;
  }

  getTooltipContent() {
    return this.tooltipContent;
  }
}