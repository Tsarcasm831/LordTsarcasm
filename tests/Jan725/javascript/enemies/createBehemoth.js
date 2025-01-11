// createBehemoth.js
import * as THREE from 'three';
import { createHumanoid } from './createHumanoid.js';
import { applyPattern } from './applyPattern.js';

/**
 * Creates a "Behemoth" enemy (colossal creature).
 */
export function createBehemoth(x, y, z) {
    const color      = 0x800080;
    const texture    = 'textures/enemies/behemoth.png';
    const pattern    = 'spiky';
    const height     = 1.9;
    const bodyShape  = 'tall';
    const damageRate = 3.5;
    const name       = 'Behemoth';

    // 1) Base humanoid
    const enemy = createHumanoid(color, texture, pattern, height, bodyShape);

    // 2) Scale for a colossal appearance
    enemy.scale.set(1.8, 1.6, 1.8);

    // Armored plates
    const platePositions = [
        { pos: [0, 14, 1.2], scale: [4, 3, 0.3] },
        { pos: [0, 11, 1.2], scale: [5, 3, 0.4] },
        { pos: [0, 8, 1.2], scale: [4.5, 3, 0.3] }
    ];
    platePositions.forEach(({pos, scale}) => {
        const plate = new THREE.Mesh(
            new THREE.BoxGeometry(1, 1, 1),
            new THREE.MeshStandardMaterial({
                color: 0x444444,
                metalness: 0.4,
                roughness: 0.8
            })
        );
        plate.position.set(...pos);
        plate.scale.set(...scale);
        enemy.add(plate);
    });

    // Massive spikes
    const spikeCount = 6;
    for (let i = 0; i < spikeCount; i++) {
        const spike = new THREE.Mesh(
            new THREE.ConeGeometry(0.6, 3, 4),
            new THREE.MeshStandardMaterial({
                color: 0x333333,
                roughness: 1.0,
                metalness: 0.2
            })
        );
        spike.position.set(0, 16 - i * 1.5, 1.5);
        spike.rotation.x = -Math.PI / 4;
        enemy.add(spike);
    }

    // 3) Final rough, reinforced appearance
    enemy.traverse(child => {
        if (child.isMesh) {
            child.material.roughness = 1.0;
            child.material.metalness = 0.3;
        }
    });

    // 4) Position & userData
    enemy.position.set(x, y, z);

    enemy.userData = {
        type: 'hostile',
        name,
        health: 100,
        isDead: false,
        hasBeenLooted: false,
        damageRate,
        pattern,
        height,
        bodyShape,
        enemyType: 'behemoth'
    };

    // 5) Apply pattern
    enemy.traverse(child => {
        if (child.isMesh) {
            applyPattern(child, pattern);
        }
    });

    return enemy;
}