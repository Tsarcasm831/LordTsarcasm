import { PineTree } from './world_objects/tree_pine.js';
import { LootableContainer } from './world_objects/container_lootable_small.js';
import { WoodenWall } from './world_objects/wooden_wall.js';
import { BrokenCar } from './world_objects/broken_car.js';
import { House } from './world_objects/house.js';
import { Rock } from './world_objects/rock.js';
import { CopperOre } from './world_objects/mineable_ore_copper.js';
import { IronOre } from './world_objects/mineable_ore_iron.js';
import { TinOre } from './world_objects/mineable_ore_tin.js';
import { FirTree } from './world_objects/tree_fir.js';  
import { MapleTree } from './world_objects/tree_maple.js';
import { DeadTree } from './world_objects/tree_dead.js';

export class World {
  constructor(tileSize, playAreaWidth, playAreaHeight) {
    this.tileSize = tileSize;
    this.playAreaWidth = playAreaWidth;
    this.playAreaHeight = playAreaHeight;
    this.tiles = this.generateWorld();
    
    this.minimapCanvas = document.createElement('canvas');
    this.minimapCanvas.width = playAreaWidth / tileSize;
    this.minimapCanvas.height = playAreaHeight / tileSize;
    this.minimapCtx = this.minimapCanvas.getContext('2d');
    this.generateMinimap();
    
    this.visibleTiles = new Set();
    this.camera = {
      x: 0,
      y: 0,
      width: playAreaWidth,
      height: playAreaHeight
    };
    this.optimizedTiles = this.createOptimizedTileCache();
    this.objects = this.generateWorldObjects();
  }

  generateWorld() {
    const width = Math.ceil(this.playAreaWidth / this.tileSize);
    const height = Math.ceil(this.playAreaHeight / this.tileSize);
    const tiles = [];
    
    // Add concrete platform dimensions
    const concreteX = 15;  
    const concreteY = 20;  
    const concreteWidth = 40; 
    const concreteHeight = 100; 

    const noise = new PerlinNoise();
    const scale = 0.1;

    for (let y = 0; y < height; y++) {
      tiles[y] = [];
      for (let x = 0; x < width; x++) {
        // Check if in concrete area
        if (x >= concreteX && x < concreteX + concreteWidth && 
            y >= concreteY && y < concreteY + concreteHeight) {
          tiles[y][x] = 'concrete';
          continue;
        }

        const value = noise.get(x * scale, y * scale);
        
        if (value < 0.3) {
          tiles[y][x] = 'water';
        } else if (value < 0.5) {
          tiles[y][x] = 'sand';
        } else {
          tiles[y][x] = Math.random() > 0.9 ? 'dirt' : 'grass';
        }
      }
    }

    return tiles;
  }

  generateMinimap() {
    const terrainPatterns = {
      grass: createGrassPattern(),
      dirt: createDirtPattern(),
      water: createWaterPattern(),
      sand: createSandPattern(),
      concrete: createConcretePattern()
    };

    this.minimapCtx.fillStyle = '#333333';
    this.minimapCtx.fillRect(0, 0, this.minimapCanvas.width, this.minimapCanvas.height);

    for (let y = 0; y < this.tiles.length; y++) {
      for (let x = 0; x < this.tiles[y].length; x++) {
        const tile = this.tiles[y][x];
        this.minimapCtx.fillStyle = terrainPatterns[tile] || terrainPatterns.grass;
        this.minimapCtx.fillRect(x, y, 1, 1);
      }
    }

    function createGrassPattern() {
      const patternCanvas = document.createElement('canvas');
      patternCanvas.width = patternCanvas.height = 16;
      const ctx = patternCanvas.getContext('2d');
      
      // Grass texture
      ctx.fillStyle = '#666666';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#999999';
      ctx.beginPath();
      for(let i = 0; i < 20; i++) {
        ctx.rect(Math.random()*16, Math.random()*16, 1, 1);
      }
      ctx.fill();
      
      return ctx.createPattern(patternCanvas, 'repeat');
    }

    function createDirtPattern() {
      const patternCanvas = document.createElement('canvas');
      patternCanvas.width = patternCanvas.height = 8;
      const ctx = patternCanvas.getContext('2d');
      
      // Dirt texture
      ctx.fillStyle = '#555555';
      ctx.fillRect(0, 0, 8, 8);
      ctx.fillStyle = '#444444';
      ctx.beginPath();
      for(let i = 0; i < 10; i++) {
        ctx.rect(Math.random()*8, Math.random()*8, 1, 1);
      }
      ctx.fill();
      
      return ctx.createPattern(patternCanvas, 'repeat');
    }

    function createWaterPattern() {
      const patternCanvas = document.createElement('canvas');
      patternCanvas.width = patternCanvas.height = 16;
      const ctx = patternCanvas.getContext('2d');
      
      // Water animation base
      ctx.fillStyle = '#444444';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.beginPath();
      ctx.moveTo(0, 8);
      ctx.bezierCurveTo(4, 4, 12, 12, 16, 8);
      ctx.stroke();
      
      return ctx.createPattern(patternCanvas, 'repeat');
    }

    function createSandPattern() {
      const patternCanvas = document.createElement('canvas');
      patternCanvas.width = patternCanvas.height = 16;
      const ctx = patternCanvas.getContext('2d');
      
      // Sand texture
      ctx.fillStyle = '#777777';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#666666';
      ctx.beginPath();
      for(let i = 0; i < 20; i++) {
        ctx.rect(Math.random()*16, Math.random()*16, 1, 1);
      }
      ctx.fill();
      
      return ctx.createPattern(patternCanvas, 'repeat');
    }

    function createConcretePattern() {
      const patternCanvas = document.createElement('canvas');
      patternCanvas.width = patternCanvas.height = 16;
      const ctx = patternCanvas.getContext('2d');
      
      // Concrete texture with grid lines
      ctx.fillStyle = '#333333';
      ctx.fillRect(0, 0, 16, 16);
      ctx.strokeStyle = '#444444';
      ctx.lineWidth = 2;
      
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(4, 0);
      ctx.lineTo(4, 16);
      ctx.moveTo(12, 0);
      ctx.lineTo(12, 16);
      // Horizontal lines
      ctx.moveTo(0, 4);
      ctx.lineTo(16, 4);
      ctx.moveTo(0, 12);
      ctx.lineTo(16, 12);
      ctx.stroke();
      
      return ctx.createPattern(patternCanvas, 'repeat');
    }
  }

  updateTile(x, y, newType) {
    this.tiles[y][x] = newType;
    const terrainPatterns = {
      grass: createGrassPattern(),
      dirt: createDirtPattern(),
      water: createWaterPattern(),
      sand: createSandPattern(),
      concrete: createConcretePattern()
    };
    this.minimapCtx.fillStyle = terrainPatterns[newType] || terrainPatterns.grass;
    this.minimapCtx.fillRect(x, y, 1, 1);

    function createGrassPattern() {
      const patternCanvas = document.createElement('canvas');
      patternCanvas.width = patternCanvas.height = 16;
      const ctx = patternCanvas.getContext('2d');
      
      // Grass texture
      ctx.fillStyle = '#666666';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#999999';
      ctx.beginPath();
      for(let i = 0; i < 20; i++) {
        ctx.rect(Math.random()*16, Math.random()*16, 1, 1);
      }
      ctx.fill();
      
      return ctx.createPattern(patternCanvas, 'repeat');
    }

    function createDirtPattern() {
      const patternCanvas = document.createElement('canvas');
      patternCanvas.width = patternCanvas.height = 8;
      const ctx = patternCanvas.getContext('2d');
      
      // Dirt texture
      ctx.fillStyle = '#555555';
      ctx.fillRect(0, 0, 8, 8);
      ctx.fillStyle = '#444444';
      ctx.beginPath();
      for(let i = 0; i < 10; i++) {
        ctx.rect(Math.random()*8, Math.random()*8, 1, 1);
      }
      ctx.fill();
      
      return ctx.createPattern(patternCanvas, 'repeat');
    }

    function createWaterPattern() {
      const patternCanvas = document.createElement('canvas');
      patternCanvas.width = patternCanvas.height = 16;
      const ctx = patternCanvas.getContext('2d');
      
      // Water animation base
      ctx.fillStyle = '#444444';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.beginPath();
      ctx.moveTo(0, 8);
      ctx.bezierCurveTo(4, 4, 12, 12, 16, 8);
      ctx.stroke();
      
      return ctx.createPattern(patternCanvas, 'repeat');
    }

    function createSandPattern() {
      const patternCanvas = document.createElement('canvas');
      patternCanvas.width = patternCanvas.height = 16;
      const ctx = patternCanvas.getContext('2d');
      
      // Sand texture
      ctx.fillStyle = '#777777';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#666666';
      ctx.beginPath();
      for(let i = 0; i < 20; i++) {
        ctx.rect(Math.random()*16, Math.random()*16, 1, 1);
      }
      ctx.fill();
      
      return ctx.createPattern(patternCanvas, 'repeat');
    }

    function createConcretePattern() {
      const patternCanvas = document.createElement('canvas');
      patternCanvas.width = patternCanvas.height = 16;
      const ctx = patternCanvas.getContext('2d');
      
      // Concrete texture with grid lines
      ctx.fillStyle = '#333333';
      ctx.fillRect(0, 0, 16, 16);
      ctx.strokeStyle = '#444444';
      ctx.lineWidth = 2;
      
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(4, 0);
      ctx.lineTo(4, 16);
      ctx.moveTo(12, 0);
      ctx.lineTo(12, 16);
      // Horizontal lines
      ctx.moveTo(0, 4);
      ctx.lineTo(16, 4);
      ctx.moveTo(0, 12);
      ctx.lineTo(16, 12);
      ctx.stroke();
      
      return ctx.createPattern(patternCanvas, 'repeat');
    }
  }

  update(deltaTime) {
    // Update tile states if needed (e.g., crops growing)
  }

  createOptimizedTileCache() {
    const terrainPatterns = {
      grass: createGrassPattern(),
      dirt: createDirtPattern(),
      water: createWaterPattern(),
      sand: createSandPattern(),
      concrete: createConcretePattern()
    };
    
    const canvas = document.createElement('canvas');
    canvas.width = this.playAreaWidth;
    canvas.height = this.playAreaHeight;
    const ctx = canvas.getContext('2d');
    
    for (let y = 0; y < this.tiles.length; y++) {
      for (let x = 0; x < this.tiles[y].length; x++) {
        ctx.fillStyle = terrainPatterns[this.tiles[y][x]] || terrainPatterns.grass;
        ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
      }
    }
    return canvas;

    function createGrassPattern() {
      const patternCanvas = document.createElement('canvas');
      patternCanvas.width = patternCanvas.height = 16;
      const ctx = patternCanvas.getContext('2d');
      
      // Grass texture
      ctx.fillStyle = '#666666';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#999999';
      ctx.beginPath();
      for(let i = 0; i < 20; i++) {
        ctx.rect(Math.random()*16, Math.random()*16, 1, 1);
      }
      ctx.fill();
      
      return ctx.createPattern(patternCanvas, 'repeat');
    }

    function createDirtPattern() {
      const patternCanvas = document.createElement('canvas');
      patternCanvas.width = patternCanvas.height = 8;
      const ctx = patternCanvas.getContext('2d');
      
      // Dirt texture
      ctx.fillStyle = '#555555';
      ctx.fillRect(0, 0, 8, 8);
      ctx.fillStyle = '#444444';
      ctx.beginPath();
      for(let i = 0; i < 10; i++) {
        ctx.rect(Math.random()*8, Math.random()*8, 1, 1);
      }
      ctx.fill();
      
      return ctx.createPattern(patternCanvas, 'repeat');
    }

    function createWaterPattern() {
      const patternCanvas = document.createElement('canvas');
      patternCanvas.width = patternCanvas.height = 16;
      const ctx = patternCanvas.getContext('2d');
      
      // Water animation base
      ctx.fillStyle = '#444444';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = 'rgba(255,255,255,0.2)';
      ctx.beginPath();
      ctx.moveTo(0, 8);
      ctx.bezierCurveTo(4, 4, 12, 12, 16, 8);
      ctx.stroke();
      
      return ctx.createPattern(patternCanvas, 'repeat');
    }

    function createSandPattern() {
      const patternCanvas = document.createElement('canvas');
      patternCanvas.width = patternCanvas.height = 16;
      const ctx = patternCanvas.getContext('2d');
      
      // Sand texture
      ctx.fillStyle = '#777777';
      ctx.fillRect(0, 0, 16, 16);
      ctx.fillStyle = '#666666';
      ctx.beginPath();
      for(let i = 0; i < 20; i++) {
        ctx.rect(Math.random()*16, Math.random()*16, 1, 1);
      }
      ctx.fill();
      
      return ctx.createPattern(patternCanvas, 'repeat');
    }

    function createConcretePattern() {
      const patternCanvas = document.createElement('canvas');
      patternCanvas.width = patternCanvas.height = 16;
      const ctx = patternCanvas.getContext('2d');
      
      // Concrete texture with grid lines
      ctx.fillStyle = '#333333';
      ctx.fillRect(0, 0, 16, 16);
      ctx.strokeStyle = '#444444';
      ctx.lineWidth = 2;
      
      // Vertical lines
      ctx.beginPath();
      ctx.moveTo(4, 0);
      ctx.lineTo(4, 16);
      ctx.moveTo(12, 0);
      ctx.lineTo(12, 16);
      // Horizontal lines
      ctx.moveTo(0, 4);
      ctx.lineTo(16, 4);
      ctx.moveTo(0, 12);
      ctx.lineTo(16, 12);
      ctx.stroke();
      
      return ctx.createPattern(patternCanvas, 'repeat');
    }
  }

  render(ctx) {
    const renderStartX = Math.floor(this.camera.x / this.tileSize) - 1;
    const renderStartY = Math.floor(this.camera.y / this.tileSize) - 1;
    const renderEndX = Math.ceil((this.camera.x + this.camera.width) / this.tileSize) + 1;
    const renderEndY = Math.ceil((this.camera.y + this.camera.height) / this.tileSize) + 1;

    // Draw cached background
    ctx.drawImage(
      this.optimizedTiles,
      renderStartX * this.tileSize,
      renderStartY * this.tileSize,
      (renderEndX - renderStartX) * this.tileSize,
      (renderEndY - renderStartY) * this.tileSize,
      renderStartX * this.tileSize,
      renderStartY * this.tileSize,
      (renderEndX - renderStartX) * this.tileSize,
      (renderEndY - renderStartY) * this.tileSize
    );

    // Enhanced water animation with irrigation effects
    const now = Date.now();
    const waterTiles = [];
    for (let y = renderStartY; y < renderEndY; y++) {
      for (let x = renderStartX; x < renderEndX; x++) {
        if (this.tiles[y]?.[x] === 'water') {
          // Pulsing green-blue color with irrigation effect
          ctx.fillStyle = `hsla(${180 + Math.sin(now*0.002 + x + y)*60}, 70%, 50%, ${0.5 + Math.sin(now*0.001)*0.2})`;
          ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);

          // Irrigation grid pattern
          ctx.strokeStyle = `rgba(144, 238, 144, ${0.3 + Math.sin(now*0.005)*0.2})`;
          ctx.lineWidth = 1;
          ctx.strokeRect(
            x * this.tileSize + 2,
            y * this.tileSize + 2,
            this.tileSize - 4,
            this.tileSize - 4
          );

          // Sparkling irrigation effect
          if (Math.random() < 0.02) {
            ctx.fillStyle = `rgba(144, 238, 144, ${0.5 + Math.random()*0.5})`;
            ctx.beginPath();
            ctx.arc(
              x * this.tileSize + Math.random() * this.tileSize,
              y * this.tileSize + Math.random() * this.tileSize,
              2 + Math.random() * 3, 0, Math.PI * 2
            );
            ctx.fill();
          }
        }
      }
    }
    this.renderObjects(ctx);
  }

  generateWorldObjects() {
    const objects = [];
    const tileSize = 32;
    
    // Add player's house near starting area
    const playerHouse = new House(
      this.playAreaWidth/2 + 200,  // Center X + offset
      this.playAreaHeight/2 - 200  // Center Y - offset
    );
    objects.push(playerHouse);

    // Add concrete platform walls
    const concreteX = 15 * tileSize;
    const concreteY = 20 * tileSize;
    const concreteWidth = 40 * tileSize;
    const concreteHeight = 100 * tileSize;
    const wallThickness = tileSize;

    // Top wall
    objects.push(new WoodenWall(
      concreteX,
      concreteY - wallThickness,
      concreteWidth,
      wallThickness
    ));

    // Bottom wall
    objects.push(new WoodenWall(
      concreteX,
      concreteY + concreteHeight,
      concreteWidth,
      wallThickness
    ));

    // Left wall
    objects.push(new WoodenWall(
      concreteX - wallThickness,
      concreteY,
      wallThickness,
      concreteHeight
    ));

    // Right wall
    objects.push(new WoodenWall(
      concreteX + concreteWidth,
      concreteY,
      wallThickness,
      concreteHeight
    ));

    // Add trees with variety and proper placement checks
    let treesPlaced = 0;
    let attempts = 0;
    const maxAttempts = 5000;
    
    while (treesPlaced < 900 && attempts < maxAttempts) {
      const x = Math.random() * this.playAreaWidth;
      const y = Math.random() * this.playAreaHeight;
      attempts++;
      
      // Get tile coordinates
      const tileX = Math.floor(x / this.tileSize);
      const tileY = Math.floor(y / this.tileSize);
      
      // Skip if invalid tile coordinates or water tile
      if (!this.tiles[tileY] || !this.tiles[tileY][tileX]) continue;
      if (this.tiles[tileY][tileX] === 'water') continue;
      if (this.tiles[tileY][tileX] === 'concrete') continue;
      
      // Skip if too close to player house or concrete platform
      if (Math.abs(x - playerHouse.x) < 300 && Math.abs(y - playerHouse.y) < 300) continue;
      if (x > concreteX && x < concreteX + concreteWidth && 
          y > concreteY && y < concreteY + concreteHeight) continue;

      // Check for collision with existing objects
      let canPlaceTree = true;
      for (const obj of objects) {
        if (!obj) continue;
        const dx = x - obj.x;
        const dy = y - obj.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Skip if too close to any existing object
        const minDistance = (obj.width || 32) / 1.5; // Use default size if width not defined
        if (distance < minDistance) {
          canPlaceTree = false;
          break;
        }
      }
      
      if (!canPlaceTree) continue;

      // Place tree if all checks pass
      const treeType = Math.random();
      if (treeType < 0.3) {
        objects.push(new PineTree(x, y));
      } else if (treeType < 0.6) {
        objects.push(new FirTree(x, y));
      } else if (treeType < 0.9) {
        objects.push(new MapleTree(x, y));
      } else {
        objects.push(new DeadTree(x, y));
      }
      treesPlaced++;
    }

    // Add rocks
    for (let i = 0; i < 30; i++) {
      objects.push(new Rock(
        Math.random() * this.playAreaWidth,
        Math.random() * this.playAreaHeight
      ));
    }
    // Add lootable containers
    for (let i = 0; i < 10; i++) {
      objects.push(new LootableContainer(
        Math.random() * this.playAreaWidth,
        Math.random() * this.playAreaHeight
      ));
    }
    // Add broken cars on concrete platform
    const carCount = 3;
    for (let i = 0; i < carCount; i++) {
      objects.push(new BrokenCar(
        concreteX + Math.random() * concreteWidth,
        concreteY + Math.random() * concreteHeight
      ));
    }
    // Add copper ore deposits
    for (let i = 0; i < 25; i++) {
      objects.push(new CopperOre(
        Math.random() * this.playAreaWidth,
        Math.random() * this.playAreaHeight
      ));
    }
    // Add iron ore deposits
    for (let i = 0; i < 20; i++) {
      objects.push(new IronOre(
        Math.random() * this.playAreaWidth,
        Math.random() * this.playAreaHeight
      ));
    }
    // Add tin ore deposits
    for (let i = 0; i < 20; i++) {
      objects.push(new TinOre(
        Math.random() * this.playAreaWidth,
        Math.random() * this.playAreaHeight
      ));
    }
    return objects;
  }

  renderObjects(ctx) {
    this.objects.forEach(obj => {
      if (obj instanceof PineTree) {
        obj.render(ctx);
      } else if (obj instanceof LootableContainer) {
        obj.render(ctx);
      } else if (obj instanceof WoodenWall) {
        obj.render(ctx);
      } else if (obj instanceof BrokenCar) {
        obj.render(ctx);
      } else if (obj instanceof House) {
        obj.render(ctx);
      } else if (obj instanceof Rock) {
        obj.render(ctx);
      } else if (obj.type === 'tree') {
        ctx.fillStyle = '#555555';
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, 20, 0, Math.PI * 2);
        ctx.fill();
      } else if (obj.type === 'stone') {
        ctx.fillStyle = '#444444';
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, 15, 0, Math.PI * 2);
        ctx.fill();
      } else if (obj instanceof CopperOre) {
        obj.render(ctx);
      } else if (obj instanceof IronOre) {
        obj.render(ctx);
      } else if (obj instanceof TinOre) {
        obj.render(ctx);
      } else if (obj instanceof FirTree) {
        obj.render(ctx);
      } else if (obj instanceof MapleTree) {
        obj.render(ctx);
      } else if (obj instanceof DeadTree) {
        obj.render(ctx);
      }
    });
  }

  drawGrassDetails(ctx, x, y) {
    // Grass blades
    for (let i = 0; i < 3; i++) {
      if (Math.random() < 0.3) {
        ctx.beginPath();
        ctx.moveTo(x * this.tileSize + Math.random() * this.tileSize, y * this.tileSize + this.tileSize);
        ctx.lineTo(x * this.tileSize + Math.random() * this.tileSize, y * this.tileSize + this.tileSize - 8);
        ctx.strokeStyle = `hsl(120, ${50 + Math.random() * 20}%, ${30 + Math.random() * 20}%)`;
        ctx.lineWidth = 1 + Math.random();
        ctx.stroke();
      }
    }
  }

  drawWaterEffects(ctx, x, y) {
    ctx.fillStyle = `rgba(66, 135, 245, ${0.5 + Math.sin(Date.now() * 0.001 + x + y) * 0.2})`;
    ctx.fillRect(x * this.tileSize, y * this.tileSize, this.tileSize, this.tileSize);
    
    // Water waves
    ctx.beginPath();
    ctx.moveTo(x * this.tileSize, y * this.tileSize + this.tileSize/2);
    ctx.bezierCurveTo(
      x * this.tileSize + this.tileSize/3, y * this.tileSize + this.tileSize/2 + Math.sin(Date.now()*0.001 + x)*4,
      x * this.tileSize + this.tileSize*2/3, y * this.tileSize + this.tileSize/2 + Math.cos(Date.now()*0.001 + y)*4,
      x * this.tileSize + this.tileSize, y * this.tileSize + this.tileSize/2
    );
    ctx.strokeStyle = `rgba(255,255,255,0.2)`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

export class GatherTree {
  checkClick(worldX, worldY) {
    // Keep current click detection logic
    if (worldX > this.x - this.width/2 && 
        worldX < this.x + this.width/2 &&
        worldY > this.y - this.height/2 && 
        worldY < this.y + this.height/2) {
      return true;
    }
    return false;
  }
}

// Simple Perlin noise implementation
class PerlinNoise {
  constructor() {
    this.gradients = {};
  }

  get(x, y) {
    const x0 = Math.floor(x);
    const x1 = x0 + 1;
    const y0 = Math.floor(y);
    const y1 = y0 + 1;

    const dx = x - x0;
    const dy = y - y0;

    const n0 = this.dotGridGradient(x0, y0, x, y);
    const n1 = this.dotGridGradient(x1, y0, x, y);
    const ix0 = this.lerp(n0, n1, dx);

    const n2 = this.dotGridGradient(x0, y1, x, y);
    const n3 = this.dotGridGradient(x1, y1, x, y);
    const ix1 = this.lerp(n2, n3, dx);

    return this.lerp(ix0, ix1, dy) * 0.5 + 0.5;
  }

  dotGridGradient(ix, iy, x, y) {
    let gradient = this.gradients[`${ix},${iy}`];
    if (!gradient) {
      const angle = Math.random() * Math.PI * 2;
      gradient = [Math.cos(angle), Math.sin(angle)];
      this.gradients[`${ix},${iy}`] = gradient;
    }
    const dx = x - ix;
    const dy = y - iy;
    return dx * gradient[0] + dy * gradient[1];
  }

  lerp(a, b, t) {
    return a + t * (b - a);
  }
}