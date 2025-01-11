// createHumans.js
import * as THREE from 'three';
import { createHumanoid } from './createHumanoid.js';
import { applyPattern } from './applyPattern.js';

/**
 * Creates a 'Human' enemy with specific tech enhancements.
 * @param {Number} x - X position
 * @param {Number} y - Y position
 * @param {Number} z - Z position
 * @returns {THREE.Group} The fully constructed Human enemy.
 */
export function createHumans(x, y, z) {
    // Hardcoded or derived from enemyTypes.humans
    const color      = 0xff0000;
    const texture    = 'textures/enemies/humans.png';
    const pattern    = 'striped';
    const height     = 1.8;
    const bodyShape  = 'muscular';
    const damageRate = 2.5;
    const name       = 'Human';

    // 1) Create the base humanoid
    const enemy = createHumanoid(color, texture, pattern, height, bodyShape);

    // 2) Unique modifications for Humans
    //    "Standard humanoid with technological enhancements"
    const techParts = [
        { pos: [1.5, 12, 0], scale: [0.5, 1, 0.3] },
        { pos: [-1.5, 12, 0], scale: [0.5, 1, 0.3] },
        { pos: [0, 10, 1], scale: [2, 0.3, 0.2] }
    ];
    techParts.forEach(part => {
        const tech = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshStandardMaterial({
                color: 0x444444,
                metalness: 0.8,
                roughness: 0.2,
                emissive: 0x00ff00,
                emissiveIntensity: 0.2
            })
        );
        tech.position.set(...part.pos);
        tech.scale.set(...part.scale);
        enemy.add(tech);
    });

    // 3) Position
    enemy.position.set(x, y, z);

    // 4) userData
    enemy.userData = {
        type: 'hostile',
        name,
        health: 100,
        isDead: false,
        hasBeenLooted: false,
        deathTime: 0,
        damageRate,
        pattern,
        height,
        bodyShape,
        enemyType: 'humans'
    };

    // 5) Re-apply or confirm pattern on child meshes
    enemy.traverse(child => {
        if (child.isMesh) {
            applyPattern(child, pattern);
        }
    });

    return enemy;
}