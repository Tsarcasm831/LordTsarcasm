// house.js (Updated)
export class House {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 200;
    this.height = 240;
    this.interactable = true;
    this.collidable = true;
    this.smokePhase = Math.random() * Math.PI * 2;
    this.lightOn = false;
    this.doorOpenPhase = 0;
    this.gardenGrowth = Math.random() * Math.PI * 2;

    // Door bounding box (relative to house center).
    // Adjust to match your door drawing in render()
    this.doorBounds = {
      offsetX: -40,
      offsetY: -50,
      width: 80,
      height: 140
    };
  }

  update(deltaTime) {
    this.smokePhase += deltaTime * 0.3;
    this.gardenGrowth += deltaTime * 0.5;
    this.lightOn = Math.sin(Date.now() * 0.002) > 0.5;
    this.doorOpenPhase = Math.min(1, this.doorOpenPhase + deltaTime * 0.5);
  }

  // Render the house on the main game canvas
  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Main structure
    ctx.fillStyle = '#deb887';
    ctx.shadowColor = 'rgba(0,0,0,0.3)';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.roundRect(-this.width / 2, -this.height / 2, this.width, this.height, 10);
    ctx.fill();

    // Door with window
    ctx.fillStyle = '#5C4033';
    ctx.shadowBlur = 20;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.roundRect(this.doorBounds.offsetX, this.doorBounds.offsetY, 
                 this.doorBounds.width, this.doorBounds.height, 8);
    ctx.fill();

    // Door handle
    ctx.fillStyle = '#8B4513';
    ctx.shadowBlur = 5;
    ctx.beginPath();
    ctx.arc(this.doorBounds.offsetX + 60, this.doorBounds.offsetY + 70, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Collision with the entire house body
  checkCollision(px, py, pWidth, pHeight) {
    return (
      px < this.x + this.width / 2 &&
      px + pWidth > this.x - this.width / 2 &&
      py < this.y + this.height / 2 &&
      py + pHeight > this.y - this.height / 2
    );
  }

  // Checks if the door region was clicked
  checkDoorClick(worldX, worldY) {
    // Convert from world coords to local coords around the house center
    const localX = worldX - this.x;
    const localY = worldY - this.y;

    const { offsetX, offsetY, width, height } = this.doorBounds;
    
    // Debug output
    console.log('Door click check:', {
      worldX, worldY,
      localX, localY,
      doorBounds: this.doorBounds,
      isInside: (
        localX >= offsetX &&
        localX <= offsetX + width &&
        localY >= offsetY &&
        localY <= offsetY + height
      )
    });

    return (
      localX >= offsetX &&
      localX <= offsetX + width &&
      localY >= offsetY &&
      localY <= offsetY + height
    );
  }
}
