// createVyraxus.js
import * as THREE from 'three';
import { createHumanoid } from './createHumanoid.js';
import { applyPattern } from './applyPattern.js';

export function createVyraxus(x, y, z) {
    const color      = 0x808080;
    const texture    = 'textures/enemies/vyraxus.png';
    const pattern    = 'scaly';
    const height     = 1.65;
    const bodyShape  = 'average';
    const damageRate = 2.9;
    const name       = 'Vyraxus';

    // 1) Base humanoid
    const enemy = createHumanoid(color, texture, pattern, height, bodyShape);

    // 2) [No special geometry from original]

    // 3) Position & userData
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
        enemyType: 'vyraxus'
    };

    // 4) Pattern
    enemy.traverse(child => {
        if (child.isMesh) {
            applyPattern(child, pattern);
        }
    });

    return enemy;
}