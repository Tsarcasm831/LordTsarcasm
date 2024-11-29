import * as THREE from 'three';
import { TEXTURES } from './config.js';

const textureLoader = new THREE.TextureLoader();

function loadTexture(url) {
    const texture = textureLoader.load(url);
    texture.magFilter = THREE.NearestFilter;
    texture.minFilter = THREE.NearestFilter;
    return texture;
}

function createMaterial(texture) {
    return new THREE.MeshStandardMaterial({
        map: texture,
        roughness: 1.0,
        metalness: 0.0
    });
}

export const materials = {
    wood: createMaterial(loadTexture(TEXTURES.WOOD)),
    stone: createMaterial(loadTexture(TEXTURES.STONE)),
    grass: createMaterial(loadTexture(TEXTURES.GRASS)),
    leaves: createMaterial(loadTexture(TEXTURES.LEAVES))
};
