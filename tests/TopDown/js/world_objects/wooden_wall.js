import { CollisionSystem } from '../collision.js';

export class WoodenWall {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.interactable = false;
    this.collidable = true;
    // Store the center position for consistent collision detection
    this.centerX = x + width / 2;
    this.centerY = y + height / 2;
  }

  checkCollision(playerX, playerY, playerWidth, playerHeight) {
    return CollisionSystem.checkRectangleCollision(
      playerX, playerY, playerWidth, playerHeight,
      this.x - this.width / 2, this.y - this.height / 2, this.width, this.height
    );
  }

  render(ctx) {
    // Save the current context state
    ctx.save();
    
    // Draw the wall
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Wood grain pattern
    ctx.strokeStyle = '#5C4033';
    ctx.lineWidth = 2;
    for(let i = 0; i < this.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(this.x + i, this.y);
      ctx.lineTo(this.x + i, this.y + this.height);
      ctx.stroke();
    }
    
    // Restore the context state
    ctx.restore();
  }
  
  // Add method to update position
  updatePosition(x, y) {
    this.x = x;
    this.y = y;
    this.centerX = x + this.width / 2;
    this.centerY = y + this.height / 2;
  }
}