import * as THREE from 'three';

class ObjectPool {
    constructor() {
        this.chunks = [];
        this.blocks = [];
        this.blockGeometry = new THREE.BoxGeometry(1, 1, 1);
    }

    getChunk() {
        return this.chunks.pop() || new THREE.Group();
    }

    getBlock(material) {
        if (this.blocks.length > 0) {
            const block = this.blocks.pop();
            block.material = material;
            return block;
        }
        return new THREE.Mesh(this.blockGeometry, material);
    }

    returnChunk(chunk) {
        this.chunks.push(chunk);
    }

    returnBlock(block) {
        this.blocks.push(block);
    }
}

export const objectPool = new ObjectPool();
