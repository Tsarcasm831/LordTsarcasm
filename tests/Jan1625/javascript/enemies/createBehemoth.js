// createBehemoth.js
import * as THREE from 'three';
import { applyPattern } from './applyPattern.js';

/**
 * Creates a "Behemoth" enemy (colossal quadrupedal creature).
 */
export function createBehemoth(x, y, z) {
    const color      = 0x800080;
    const texture    = 'textures/enemies/behemoth.png';
    const pattern    = 'spiky';
    const height     = 1.9;
    const bodyShape  = 'massive';
    const damageRate = 3.5;
    const name       = 'Behemoth';

    // 1) Create the base creature
    const enemy = new THREE.Group();

    // Main body
    const body = new THREE.Mesh(
        new THREE.BoxGeometry(3, 1.8, 4),
        new THREE.MeshStandardMaterial({ color })
    );
    body.position.y = 2;
    enemy.add(body);

    // Neck and head
    const neck = new THREE.Mesh(
        new THREE.BoxGeometry(1.5, 1.2, 1.8),
        new THREE.MeshStandardMaterial({ color })
    );
    neck.position.set(0, 2.8, 1.8);
    neck.rotation.x = -Math.PI / 6;
    enemy.add(neck);

    const head = new THREE.Mesh(
        new THREE.BoxGeometry(2, 1.4, 2),
        new THREE.MeshStandardMaterial({ color })
    );
    head.position.set(0, 3.2, 2.8);
    enemy.add(head);

    // Legs
    const legPositions = [
        { x: 1.2, z: 1.5 },   // Front right
        { x: -1.2, z: 1.5 },  // Front left
        { x: 1.2, z: -1.5 },  // Back right
        { x: -1.2, z: -1.5 }  // Back left
    ];

    legPositions.forEach(pos => {
        const leg = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 2, 0.8),
            new THREE.MeshStandardMaterial({ color })
        );
        leg.position.set(pos.x, 1, pos.z);
        enemy.add(leg);
    });

    // Armored plates on body
    const platePositions = [
        { pos: [0, 3, 0], scale: [3.2, 0.3, 4.2] },     // Top
        { pos: [0, 2, 2], scale: [3.2, 1.8, 0.3] },     // Front
        { pos: [0, 2, -2], scale: [3.2, 1.8, 0.3] },    // Back
        { pos: [1.6, 2, 0], scale: [0.3, 1.8, 4.2] },   // Right
        { pos: [-1.6, 2, 0], scale: [0.3, 1.8, 4.2] }   // Left
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

    // Spikes along the spine
    const spikeCount = 8;
    for (let i = 0; i < spikeCount; i++) {
        const spike = new THREE.Mesh(
            new THREE.ConeGeometry(0.4, 1.5, 4),
            new THREE.MeshStandardMaterial({
                color: 0x333333,
                roughness: 1.0,
                metalness: 0.2
            })
        );
        spike.position.set(0, 3.2, 1.5 - i * 0.5);
        spike.rotation.x = Math.PI / 2;
        enemy.add(spike);
    }

    // Scale for a colossal appearance
    enemy.scale.set(1.8, 1.6, 1.8);

    // Apply rough, reinforced appearance
    enemy.traverse(child => {
        if (child.isMesh) {
            child.material.roughness = 1.0;
            child.material.metalness = 0.3;
        }
    });

    // Position & userData
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

    // Apply pattern
    enemy.traverse(child => {
        if (child.isMesh) {
            applyPattern(child, pattern);
        }
    });

    return enemy;
}