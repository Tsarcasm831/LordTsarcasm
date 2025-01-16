// createBubbleBeing.js
import * as THREE from 'three';
import { createHumanoid } from './createHumanoid.js';
import { applyPattern } from './applyPattern.js';

/**
 * Creates a "Bubble Being" enemy (small, round).
 */
export function createBubbleBeing(x, y, z) {
    const color      = 0x88ccff;
    // NOTE: the texture key in enemyTypes was 'textures/enemies/vyraxus.png' 
    // but that seems possibly a placeholder. Replace with your actual Bubble Being texture if needed:
    const texture    = 'textures/enemies/vyraxus.png'; 
    const pattern    = 'plain';
    const height     = 1.4;
    const bodyShape  = 'round';
    const damageRate = 2.0;
    const name       = 'Bubble Being';

    // 1) Base humanoid
    const enemy = createHumanoid(color, texture, pattern, height, bodyShape);

    // 2) Because it's "bubble" shaped, we can scale or add a spherical overlay
    enemy.scale.set(0.9, 0.9, 0.9); // slightly smaller than average

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
        enemyType: 'bubble_being'
    };

    // 4) Pattern
    enemy.traverse(child => {
        if (child.isMesh) {
            applyPattern(child, pattern);
        }
    });

    return enemy;
}