/*
 chunk4d1.js

 A "4D" clone of our main World class that mirrors or binds actions taken in the 3D dimension.
 This can be instantiated alongside the main game world so that changes in the main dimension
 also appear here.

 For example usage, you can have something like:
    this.world4D = new World4D(...);
 in your main game code, and then whenever the main world does something (updates a tile, adds
 an object, removes an object), you can call `world4D.mirrorFromMainWorld(this.world)` to replicate
 those changes on the 4D side.

 NOTE:
 - This is just an example scaffold. You can tweak or rename methods as needed.
 - If you prefer to fully replicate the logic internally (rather than reimporting and extending),
   you could duplicate your entire chunk.js code and rename the class/variables.
*/

import { PineTree } from './world_objects/tree_pine.js';
import { FirTree } from './world_objects/tree_fir.js';
import { MapleTree } from './world_objects/tree_maple.js';
import { DeadTree } from './world_objects/tree_dead.js';
import { Rock } from './world_objects/rock.js';
import { CopperOre } from './world_objects/mineable_ore_copper.js';
import { IronOre } from './world_objects/mineable_ore_iron.js';
import { TinOre } from './world_objects/mineable_ore_tin.js';
import { LootableContainer } from './world_objects/container_lootable_small.js';
import { WoodenWall } from './world_objects/wooden_wall.js';
import { BrokenCar } from './world_objects/broken_car.js';
import { House } from './world_objects/house.js';

// Option A: Extend the original World class directly
// --------------------------------------------------
// If you want to build on the same logic as chunk.js, you can do something like:
//
//    import { World } from './chunk.js';
//    export class World4D extends World {
//      constructor(tileSize, playAreaWidth, playAreaHeight) {
//        super(tileSize, playAreaWidth, playAreaHeight);
//        // Additional 4D-specific logic here
//      }
//      ...
//    }
//
// Option B: Duplicate the entire code, rename class, and adapt as needed
// ----------------------------------------------------------------------

/*
// Option A Example:
import { World } from './chunk.js';

export class World4D extends World {
  constructor(tileSize, playAreaWidth, playAreaHeight) {
    super(tileSize, playAreaWidth, playAreaHeight);
    // Additional property for '4D transformations' or special states
    this.is4thDimension = true;
  }

  // Example override for tile update, so it can behave differently or
  // store extra data that the main dimension doesn't have
  updateTile(x, y, newType) {
    super.updateTile(x, y, newType);
    // Additional "4D" code or side effects here:
    console.log(`(4D) Updated tile: ${x}, ${y}, type=${newType}`);
  }

  // Example method to replicate data from the main dimension.
  mirrorFromMainWorld(mainWorld) {
    // You could read mainWorld.tiles, mainWorld.objects, etc., 
    // and ensure they match in World4D. E.g.:
    this.tiles = JSON.parse(JSON.stringify(mainWorld.tiles));
    // or do a more granular sync approach.

    this.objects = mainWorld.objects.map(obj => {
      // Optionally clone each object for 4D
      // (In real usage, you’ll want deeper references or a specialized
      // "constructor switch" to build 4D versions if needed.)
      return {...obj};
    });
  }
}
*/

// For completeness, here is a full duplication approach (Option B),
// with a new class name `World4D` replacing the original references.

export class World4D {
  constructor(tileSize, playAreaWidth, playAreaHeight) {
    this.tileSize = tileSize;
    this.playAreaWidth = playAreaWidth;
    this.playAreaHeight = playAreaHeight;

    // Generate "4D" terrain or map
    this.tiles = this.generateWorld4D();

    // Recreate minimap logic if you’d like a separate 4D minimap
    this.minimapCanvas = document.createElement('canvas');
    this.minimapCanvas.width = playAreaWidth / tileSize;
    this.minimapCanvas.height = playAreaHeight / tileSize;
    this.minimapCtx = this.minimapCanvas.getContext('2d');
    this.generateMinimap4D();

    this.visibleTiles = new Set();
    this.camera = {
      x: 0,
      y: 0,
      width: playAreaWidth,
      height: playAreaHeight,
    };

    // For performance, create a single large "4D tile" cache
    this.optimizedTiles = this.createOptimizedTileCache4D();

    // 4D objects
    this.objects = this.generateWorldObjects4D();
  }

  // Example method: read from your mainWorld to replicate in the 4D world
  mirrorFromMainWorld(mainWorld) {
    // If you want a direct, real-time clone, you can do a full copy:
    this.tiles = JSON.parse(JSON.stringify(mainWorld.tiles));

    // Re-generate the 4D minimap or tile cache after changes
    this.generateMinimap4D();
    this.optimizedTiles = this.createOptimizedTileCache4D();

    // Copy the objects from the main dimension
    // Caution: if the objects have references that can’t be shallow-copied, you need deeper logic
    this.objects = mainWorld.objects.map(obj => {
      // Minimal shallow clone example:
      return { ...obj };
    });
  }

  // Generate 4D world terrain
  generateWorld4D() {
    const width = Math.ceil(this.playAreaWidth / this.tileSize);
    const height = Math.ceil(this.playAreaHeight / this.tileSize);
    const tiles = [];

    // In 4D we might imagine extra cosmic regions or "hyper-sand," etc.
    // For demonstration, we’ll do something similar to the original generation.
    const noise = new PerlinNoise4D();
    const scale = 0.12; // maybe slightly different scale

    for (let y = 0; y < height; y++) {
      tiles[y] = [];
      for (let x = 0; x < width; x++) {
        const value = noise.get(x * scale, y * scale, 0.3, 1.1); 
        // 4D noise function is hypothetical – see PerlinNoise4D below

        if (value < 0.25) {
          tiles[y][x] = 'hyper-water';
        } else if (value < 0.5) {
          tiles[y][x] = 'ghost-sand';
        } else if (value < 0.75) {
          tiles[y][x] = 'warp-grass';
        } else {
          tiles[y][x] = 'dark-concrete';
        }
      }
    }
    return tiles;
  }

  // Generate minimap for the 4D world
  generateMinimap4D() {
    const terrainColors = {
      'hyper-water': '#3355ff',
      'ghost-sand': '#999999',
      'warp-grass': '#55ff55',
      'dark-concrete': '#222222',
    };

    this.minimapCtx.fillStyle = '#111111';
    this.minimapCtx.fillRect(0, 0, this.minimapCanvas.width, this.minimapCanvas.height);

    for (let y = 0; y < this.tiles.length; y++) {
      for (let x = 0; x < this.tiles[y].length; x++) {
        const tileType = this.tiles[y][x] || 'warp-grass';
        this.minimapCtx.fillStyle = terrainColors[tileType] || '#999999';
        this.minimapCtx.fillRect(x, y, 1, 1);
      }
    }
  }

  // Build a single drawn tile cache for the 4D map
  createOptimizedTileCache4D() {
    const canvas = document.createElement('canvas');
    canvas.width = this.playAreaWidth;
    canvas.height = this.playAreaHeight;
    const ctx = canvas.getContext('2d');

    // Because we’re “duplicating” logic, you can adapt the pattern usage:
    for (let y = 0; y < this.tiles.length; y++) {
      for (let x = 0; x < this.tiles[y].length; x++) {
        const tile = this.tiles[y][x];
        ctx.fillStyle = this.getPatternFor4DTile(tile);
        ctx.fillRect(
          x * this.tileSize,
          y * this.tileSize,
          this.tileSize,
          this.tileSize
        );
      }
    }
    return canvas;
  }

  // A placeholder for different textures or patterns in 4D
  getPatternFor4DTile(tileType) {
    // In a real game, you’d build or load your pattern, or just use a solid fill style
    switch (tileType) {
      case 'hyper-water': return '#3355ff';
      case 'ghost-sand':  return '#777777';
      case 'warp-grass':  return '#55ff55';
      case 'dark-concrete': return '#444444';
      default: return '#888888';
    }
  }

  // Generate some objects in the 4D world (mirroring chunk.js structure)
  generateWorldObjects4D() {
    const objects = [];

    // Example: a single 4D "house," 4D rocks, etc.
    const fourDHouse = new House(
      this.playAreaWidth / 2,
      this.playAreaHeight / 2,
    );
    objects.push(fourDHouse);

    // A small batch of 4D "trees"
    for (let i = 0; i < 10; i++) {
      objects.push(new PineTree(
        Math.random() * this.playAreaWidth,
        Math.random() * this.playAreaHeight
      ));
    }

    // Possibly we place 4D versions of each object 
    // (just reusing the same classes for demonstration).
    for (let i = 0; i < 5; i++) {
      objects.push(new Rock(
        Math.random() * this.playAreaWidth,
        Math.random() * this.playAreaHeight
      ));
    }

    // ...and so on with ore, containers, etc.
    objects.push(new LootableContainer(
      Math.random() * this.playAreaWidth,
      Math.random() * this.playAreaHeight
    ));

    return objects;
  }

  // If you want to "update" the 4D world in lockstep with the main world:
  update(deltaTime) {
    // Mirror main dimension changes or do 4D-specific updates
    // For example: some special time shift or illusions
  }

  // Basic camera culling check
  isInViewport(obj, camera) {
    const margin = 100;
    return (
      obj.x + obj.width / 2 + margin >= camera.x &&
      obj.x - obj.width / 2 - margin <= camera.x + camera.width &&
      obj.y + obj.height / 2 + margin >= camera.y &&
      obj.y - obj.height / 2 - margin <= camera.y + camera.height
    );
  }

  // 4D world render
  render(ctx, camera) {
    // 1) Draw the tile cache
    ctx.drawImage(
      this.optimizedTiles,
      camera.x,
      camera.y,
      camera.width,
      camera.height,
      camera.x,
      camera.y,
      camera.width,
      camera.height
    );

    // 2) Render only visible 4D objects
    for (const obj of this.objects) {
      if (this.isInViewport(obj, camera)) {
        const screenX = obj.x - camera.x;
        const screenY = obj.y - camera.y;
        obj.render?.(ctx, screenX, screenY);
      }
    }
  }
}

/*
  Example PerlinNoise4D: A *mock* 4D noise class. Typically you’d import a proper 4D
  noise library or extend your existing noise to accept additional dimensions.

  For demonstration, we’ll just combine the classic 2D approach with extra parameters
  to pseudo-randomly shift the result.
*/
class PerlinNoise4D {
  constructor() {
    this.gradients = {};
  }

  // A simplified usage for 4D: x, y, z, w
  get(x, y, z = 0, w = 0) {
    // In reality, a 4D noise function is more elaborate, but we can cheat
    // by mixing z, w into the “seed” for 2D to get consistent but shifted results:
    const xOff = x + z * 10 + w * 100;
    const yOff = y + z * 10 - w * 100;

    // Reuse the 2D approach:
    const x0 = Math.floor(xOff);
    const y0 = Math.floor(yOff);
    const dx = xOff - x0;
    const dy = yOff - y0;

    const n0 = this.dotGridGradient(x0, y0, xOff, yOff);
    const n1 = this.dotGridGradient(x0 + 1, y0, xOff, yOff);
    const ix0 = this.lerp(n0, n1, dx);

    const n2 = this.dotGridGradient(x0, y0 + 1, xOff, yOff);
    const n3 = this.dotGridGradient(x0 + 1, y0 + 1, xOff, yOff);
    const ix1 = this.lerp(n2, n3, dx);

    const val = this.lerp(ix0, ix1, dy) * 0.5 + 0.5;
    return val;
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
