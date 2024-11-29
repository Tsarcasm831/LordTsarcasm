import * as THREE from 'three';
import { CHUNK_SIZE, TREE_CHANCE } from './config.js';
import { objectPool } from './objectPool.js';
import { materials } from './materials.js';

export function getTerrainHeight(x, z) {
    const frequency1 = 0.1;
    const frequency2 = 0.05;
    const amplitude1 = 1.5;
    const amplitude2 = 0.8;

    let height = Math.sin(x * frequency1) * Math.cos(z * frequency1) * amplitude1 +
                 Math.sin(x * frequency2 + z * frequency2) * amplitude2;

    return Math.max(0, Math.round(height));
}

export function generateTree(x, baseHeight, z, chunk) {
    const trunkHeight = 4;
    
    // Generate trunk
    for (let y = baseHeight + 1; y <= baseHeight + trunkHeight; y++) {
        const block = objectPool.getBlock(materials.wood);
        block.position.set(x, y, z);
        chunk.add(block);
    }

    // Generate leaves
    for (let dx = -2; dx <= 2; dx++) {
        for (let dy = 0; dy <= 2; dy++) {
            for (let dz = -2; dz <= 2; dz++) {
                if (Math.abs(dx) === 2 && Math.abs(dz) === 2) continue;
                const block = objectPool.getBlock(materials.leaves);
                block.position.set(
                    x + dx,
                    baseHeight + trunkHeight + dy,
                    z + dz
                );
                chunk.add(block);
            }
        }
    }
}

export function generateChunk(chunkX, chunkZ, currentRenderDistance) {
    const chunk = objectPool.getChunk();
    const startX = chunkX * CHUNK_SIZE;
    const startZ = chunkZ * CHUNK_SIZE;

    for(let x = 0; x < CHUNK_SIZE; x++) {
        for(let z = 0; z < CHUNK_SIZE; z++) {
            const worldX = startX + x;
            const worldZ = startZ + z;
            const distToSpawn = Math.sqrt(worldX * worldX + worldZ * worldZ);
            if (distToSpawn > currentRenderDistance * CHUNK_SIZE * 1.5) continue;

            const baseHeight = getTerrainHeight(worldX, worldZ);

            // Generate ground blocks
            for(let y = 0; y <= baseHeight; y++) {
                const block = objectPool.getBlock(
                    y === baseHeight ? materials.grass :
                    y > baseHeight - 3 ? materials.dirt :
                    materials.stone
                );
                block.position.set(worldX, y, worldZ);
                chunk.add(block);
            }

            // Randomly generate trees
            if (Math.random() < TREE_CHANCE && baseHeight > 0) {
                generateTree(worldX, baseHeight, worldZ, chunk);
            }
        }
    }

    return chunk;
}
