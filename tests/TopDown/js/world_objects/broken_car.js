import { ITEMS } from '../items.js';

export class BrokenCar {
  // Static property to hold the image, ensuring it's loaded only once
  static image = new Image();
  static isImageLoaded = false;

  constructor(x, y) {
    this.x = x;
    this.y = y;
    
    // Set dimensions based on the image size or desired size
    this.width = 80; // Adjust if necessary
    this.height = 40; // Adjust if necessary

    this.interactable = true;
    this.contents = this.generateLoot();
    this.isOpen = false;
    this.swingPhase = Math.random() * Math.PI * 2;
    this.smokePhase = 0;

    // Load the image if not already loaded
    if (!BrokenCar.isImageLoaded) {
      BrokenCar.image.src = 'https://file.garden/Zy7B0LkdIVpGyzA1/broken_car.png';
      BrokenCar.image.onload = () => {
        BrokenCar.isImageLoaded = true;
        console.log('Broken car image loaded successfully.');
      };
      BrokenCar.image.onerror = () => {
        console.error('Failed to load broken car image.');
      };
    }
  }

  generateLoot() {
    const lootTable = [
      { item: 'scrap_metal', min: 2, max: 5 },
      { item: 'engine_part', min: 1, max: 1 }
    ];
    
    return lootTable.flatMap(entry => 
      Array.from({ length: Math.floor(Math.random() * (entry.max - entry.min + 1)) + entry.min }, 
        () => ITEMS[entry.item])
    ).filter(Boolean);
  }

  update(deltaTime) {
    this.swingPhase += deltaTime * 0.5;
    this.smokePhase += deltaTime * 2;
  }

  checkClick(worldX, worldY) {
    return worldX > this.x - this.width / 2 && 
           worldX < this.x + this.width / 2 &&
           worldY > this.y - this.height / 2 && 
           worldY < this.y + this.height / 2;
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);

    // Draw the broken car image if loaded
    if (BrokenCar.isImageLoaded) {
      ctx.drawImage(
        BrokenCar.image,
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      );
    } else {
      // Fallback: Draw a placeholder if the image isn't loaded yet
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
      ctx.fillStyle = '#FF0000';
      ctx.fillText('Car', -10, 0);
    }

    // Optional: Add smoke effect
    if (!this.isOpen) {
      ctx.fillStyle = `rgba(50, 50, 50, ${0.3 + Math.sin(this.smokePhase) * 0.2})`;
      ctx.beginPath();
      ctx.arc(0, -this.height / 2 - 10, 8 + Math.sin(this.smokePhase) * 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}