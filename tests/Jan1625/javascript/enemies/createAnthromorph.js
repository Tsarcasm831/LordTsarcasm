// createAnthromorph.js
import * as THREE from 'three';
import { createHumanoid } from './createHumanoid.js';
import { applyPattern } from './applyPattern.js';

/**
 * Creates an "Anthromorph" enemy (beast-like).
 */
export function createAnthromorph(x, y, z) {
    const color      = 0x00ff00;
    const texture    = 'textures/enemies/anthromorph.png';
    const pattern    = 'scaly';
    const height     = 1.7;
    const bodyShape  = 'stocky';
    const damageRate = 2.8;
    const name       = 'Anthromorph';

    // 1) Base humanoid
    const enemy = createHumanoid(color, texture, pattern, height, bodyShape);

    // 2) Beast-like adjustments
    enemy.scale.set(1.3, 1.1, 1.3);

    // Snout
    const snoutGeometry = new THREE.CylinderGeometry(0.3, 0.5, 1.5, 8);
    const snout = new THREE.Mesh(snoutGeometry, new THREE.MeshStandardMaterial({
        color,
        roughness: 0.9
    }));
    snout.rotation.x = Math.PI / 2;
    snout.position.set(0, 18, 1);
    enemy.add(snout);

    // Extra muscular arms
    const extraArms = createHumanoid(color, texture, pattern, height * 0.8, 'muscular');
    extraArms.traverse(child => {
        if (child.isMesh) {
            const isArm = child.position.x !== 0 && child.position.y > 8;
            if (!isArm) {
                // Hide everything except arms
                child.visible = false;
            } else {
                child.material.roughness = 0.9;
            }
        }
    });
    extraArms.position.y = -2;
    extraArms.rotation.y = Math.PI / 6;
    enemy.add(extraArms);

    // Claws
    const clawPositions = [
        { pos: [2.5, 11, 0], rot: [0, 0, -Math.PI / 4] },
        { pos: [-2.5, 11, 0], rot: [0, 0, Math.PI / 4] },
        { pos: [2.5, 7, 0], rot: [0, 0, -Math.PI / 4] },
        { pos: [-2.5, 7, 0], rot: [0, 0, Math.PI / 4] }
    ];
    clawPositions.forEach(({pos, rot}) => {
        const claw = new THREE.Mesh(
            new THREE.ConeGeometry(0.2, 1, 4),
            new THREE.MeshStandardMaterial({
                color: 0x111111,
                metalness: 0.4,
                roughness: 0.6
            })
        );
        claw.position.set(...pos);
        claw.rotation.set(...rot);
        enemy.add(claw);
    });

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
        enemyType: 'anthromorph'
    };

    // 4) Apply pattern
    enemy.traverse(child => {
        if (child.isMesh) {
            applyPattern(child, pattern);
        }
    });

    return enemy;
}