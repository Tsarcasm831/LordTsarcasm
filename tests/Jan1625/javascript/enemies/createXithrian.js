// createXithrian.js
import * as THREE from 'three';
import { createHumanoid } from './createHumanoid.js';
import { applyPattern } from './applyPattern.js';

export function createXithrian(x, y, z) {
    const color      = 0xa52a2a;
    const texture    = 'textures/enemies/xithrian.png';
    const pattern    = 'geometric';
    const height     = 1.75;
    const bodyShape  = 'stocky';
    const damageRate = 2.7;
    const name       = 'Xithrian';

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
        enemyType: 'xithrian'
    };

    // 4) Pattern
    enemy.traverse(child => {
        if (child.isMesh) {
            applyPattern(child, pattern);
        }
    });

    return enemy;
}