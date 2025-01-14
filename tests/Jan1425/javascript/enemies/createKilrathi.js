// createKilrathi.js
import * as THREE from 'three';
import { createHumanoid } from './createHumanoid.js';
import { applyPattern } from './applyPattern.js';

export function createKilrathi(x, y, z) {
    const color      = 0xff00ff;
    const texture    = 'textures/enemies/kilrathi.png';
    const pattern    = 'dotted';
    const height     = 1.7;
    const bodyShape  = 'average';
    const damageRate = 3.2;
    const name       = 'Kilrathi';

    // 1) Base humanoid
    const enemy = createHumanoid(color, texture, pattern, height, bodyShape);

    // 2) [No special geometry modifications in the original switch — add if you like]

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
        enemyType: 'kilrathi'
    };

    // 4) Pattern
    enemy.traverse(child => {
        if (child.isMesh) {
            applyPattern(child, pattern);
        }
    });

    return enemy;
}