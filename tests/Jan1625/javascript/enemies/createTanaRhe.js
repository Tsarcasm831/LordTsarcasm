// createTanaRhe.js
import * as THREE from 'three';
import { createHumanoid } from './createHumanoid.js';
import { applyPattern } from './applyPattern.js';

export function createTanaRhe(x, y, z) {
    const color      = 0xffffff;
    const texture    = 'textures/enemies/tana_rhe.png';
    const pattern    = 'spotted';
    const height     = 1.7;
    const bodyShape  = 'tall';
    const damageRate = 3.0;
    const name       = "T'ana'Rhe";

    // 1) Base humanoid
    const enemy = createHumanoid(color, texture, pattern, height, bodyShape);

    // 2) [No specific geometry in original code — free to elaborate with 'spotted' styling]

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
        enemyType: 'tana_rhe'
    };

    // 4) Pattern
    enemy.traverse(child => {
        if (child.isMesh) {
            applyPattern(child, pattern);
        }
    });

    return enemy;
}