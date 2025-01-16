// createPrometheusAi.js
import * as THREE from 'three';
import { createHumanoid } from './createHumanoid.js';
import { applyPattern } from './applyPattern.js';

export function createPrometheusAi(x, y, z) {
    const color      = 0x32cd32;
    const texture    = 'textures/enemies/prometheus_ai.png';
    const pattern    = 'camouflage';
    const height     = 1.6;
    const bodyShape  = 'stocky';
    const damageRate = 2.6;
    const name       = 'Prometheus AI';

    // 1) Base humanoid
    const enemy = createHumanoid(color, texture, pattern, height, bodyShape);

    // 2) [No special geometry from the original code — free to customize as "AI" look]

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
        enemyType: 'prometheus_ai'
    };

    // 4) Pattern
    enemy.traverse(child => {
        if (child.isMesh) {
            applyPattern(child, pattern);
        }
    });

    return enemy;
}