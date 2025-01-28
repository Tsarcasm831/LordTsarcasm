export class WoodenWall {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.interactable = false;
    this.collidable = true;
  }

  checkCollision(playerX, playerY, playerWidth, playerHeight) {
    return playerX < this.x + this.width &&
           playerX + playerWidth > this.x &&
           playerY < this.y + this.height &&
           playerY + playerHeight > this.y;
  }

  render(ctx) {
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
  }
}