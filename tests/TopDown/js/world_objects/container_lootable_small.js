import { ITEMS } from '../items.js';

class ChestSprite {
  static instance = null;
  static image = null;
  static imageLoaded = false;

  static getInstance() {
    if (!ChestSprite.instance) {
      ChestSprite.instance = new ChestSprite();
    }
    return ChestSprite.instance;
  }

  constructor() {
    if (!ChestSprite.image) {
      ChestSprite.image = new Image();
      ChestSprite.image.crossOrigin = "anonymous";
      
      // Create a promise for image loading
      this.loadPromise = new Promise((resolve, reject) => {
        ChestSprite.image.onload = () => {
          console.log('Chest image loaded successfully');
          ChestSprite.imageLoaded = true;
          resolve();
        };
        ChestSprite.image.onerror = (err) => {
          console.error('Failed to load chest image:', err);
          reject(err);
        };
      });

      ChestSprite.image.src = 'https://file.garden/Zy7B0LkdIVpGyzA1/chest.png';
    }
  }

  getImage() {
    return ChestSprite.image;
  }

  isLoaded() {
    return ChestSprite.imageLoaded;
  }
}

export class LootableContainer {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 40;
    this.height = 40;
    this.interactable = true;
    this.contents = this.generateLoot();
    this.isOpen = false;
    this.swingPhase = Math.random() * Math.PI * 2;
    this.sprite = ChestSprite.getInstance();
  }

  generateLoot() {
    const lootTable = [
      { item: 'wood', min: 3, max: 8 },
      { item: 'stone', min: 2, max: 5 }
    ];
    
    return lootTable.flatMap(entry => 
      Array.from({ length: Math.floor(Math.random() * (entry.max - entry.min + 1)) + entry.min }, 
        () => ITEMS[entry.item])
    ).filter(Boolean);
  }

  update(deltaTime) {
    this.swingPhase += deltaTime * 0.5;
  }

  checkClick(worldX, worldY) {
    return worldX > this.x - this.width/2 && 
           worldX < this.x + this.width/2 &&
           worldY > this.y - this.height/2 && 
           worldY < this.y + this.height/2;
  }

  render(ctx) {
    ctx.save();
    ctx.translate(this.x, this.y);
    
    if (!this.sprite.isLoaded()) {
      // Draw placeholder while image loads
      ctx.fillStyle = '#8B4513';
      ctx.fillRect(-this.width/2, -this.height/2, this.width, this.height);
    } else {
      ctx.save();
      // Apply slight sway animation when closed
      if (!this.isOpen) {
        ctx.rotate(Math.sin(this.swingPhase) * 0.1);
      }
      ctx.drawImage(this.sprite.getImage(), -this.width/2, -this.height/2, this.width, this.height);
      ctx.restore();

      // Sparkle effect for closed chests
      if (Math.random() < 0.1 && !this.isOpen) {
        ctx.fillStyle = `hsla(50, 100%, 70%, ${Math.random()})`;
        ctx.beginPath();
        ctx.arc(
          -15 + Math.random() * 30,
          -15 + Math.random() * 15,
          2 + Math.random() * 3,
          0, Math.PI * 2
        );
        ctx.fill();
      }
    }

    ctx.restore();
  }
}