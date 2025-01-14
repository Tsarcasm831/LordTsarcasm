// createDengarCharger.js
import * as THREE from 'three';
import { createHumanoid } from './createHumanoid.js';
import { applyPattern } from './applyPattern.js';

export function createDengarCharger(x, y, z) {
    const color      = 0x00ffff;
    const texture    = 'textures/enemies/dengar_charger.png';
    const pattern    = 'geometric';
    const height     = 1.65;
    const bodyShape  = 'slim';
    const damageRate = 3.0;
    const name       = 'Dengar Charger';

    // 1) Base humanoid
    const enemy = createHumanoid(color, texture, pattern, height, bodyShape);

    // 2) [No special geometry modifications specified — you can add some if desired]

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
        enemyType: 'dengar_charger'
    };

    // 4) Apply pattern
    enemy.traverse(child => {
        if (child.isMesh) {
            applyPattern(child, pattern);
        }
    });

    return enemy;
}