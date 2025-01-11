// createTalorian.js
import * as THREE from 'three';
import { createHumanoid } from './createHumanoid.js';
import { applyPattern } from './applyPattern.js';

export function createTalorian(x, y, z) {
    const color      = 0x000000;
    const texture    = 'textures/enemies/talorian.png';
    const pattern    = 'plain';
    const height     = 1.8;
    const bodyShape  = 'muscular';
    const damageRate = 3.5;
    const name       = 'Talorian';

    // 1) Base humanoid
    const enemy = createHumanoid(color, texture, pattern, height, bodyShape);

    // 2) [No specific geometry in original switch]

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
        enemyType: 'talorian'
    };

    // 4) Pattern
    enemy.traverse(child => {
        if (child.isMesh) {
            applyPattern(child, pattern);
        }
    });

    return enemy;
}