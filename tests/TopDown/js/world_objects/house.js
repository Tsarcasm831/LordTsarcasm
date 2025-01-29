// house.js (Updated)
import { CollisionSystem } from '../collision.js';

export class House {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 200;
    this.height = 240;
    this.interactable = true;
    this.collidable = true;
    this.doorOpenPhase = 0;

    // Load the house image
    this.image = new Image();
    this.image.src = 'https://file.garden/Zy7B0LkdIVpGyzA1/house.png';

    // Door bounding box (relative to house center)
    this.doorBounds = {
      offsetX: -40,
      offsetY: -50,
      width: 80,
      height: 140
    };
  }

  update(deltaTime) {
    this.doorOpenPhase = Math.min(1, this.doorOpenPhase + deltaTime * 0.5);
  }

  // Render the house on the main game canvas
  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    
    // Draw the house image centered at (x,y)
    ctx.drawImage(
      this.image, 
      -this.width / 2, 
      -this.height / 2, 
      this.width, 
      this.height
    );

    ctx.restore();
  }

  // Collision with the entire house body
  checkCollision(px, py, pWidth, pHeight) {
    return CollisionSystem.checkRectangleCollision(
      px, py, pWidth, pHeight,
      this.x - this.width / 2, this.y - this.height / 2,
      this.width, this.height
    );
  }

  // Checks if the door region was clicked
  checkDoorClick(worldX, worldY) {
    // Convert from world coords to local coords around the house center
    const localX = worldX - this.x;
    const localY = worldY - this.y;

    return CollisionSystem.pointInRectangle(
      localX, localY,
      this.doorBounds.offsetX, this.doorBounds.offsetY,
      this.doorBounds.width, this.doorBounds.height
    );
  }
}
